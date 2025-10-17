-- Working ClinicSync Schema (No Authentication Issues)
-- This schema works without any authentication problems

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS public.bill_items CASCADE;
DROP TABLE IF EXISTS public.bills CASCADE;
DROP TABLE IF EXISTS public.visit_treatments CASCADE;
DROP TABLE IF EXISTS public.visits CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.revenue_entries CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table (simplified)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    unit TEXT DEFAULT 'piece',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patients table
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT,
    address TEXT,
    medical_history TEXT,
    allergies TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create visits table
CREATE TABLE public.visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    visit_date TIMESTAMP WITH TIME ZONE NOT NULL,
    visit_type TEXT DEFAULT 'consultation',
    chief_complaint TEXT,
    diagnosis TEXT,
    treatment_notes TEXT,
    follow_up_date DATE,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create visit_treatments table
CREATE TABLE public.visit_treatments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bills table
CREATE TABLE public.bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_number TEXT UNIQUE NOT NULL,
    patient_id UUID REFERENCES public.patients(id),
    visit_id UUID REFERENCES public.visits(id),
    bill_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date DATE,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    payment_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bill_items table
CREATE TABLE public.bill_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID REFERENCES public.bills(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category TEXT,
    expense_date DATE NOT NULL,
    receipt_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create revenue_entries table
CREATE TABLE public.revenue_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category TEXT,
    revenue_date DATE NOT NULL,
    source TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_name ON public.products(name);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_patients_name ON public.patients(first_name, last_name);
CREATE INDEX idx_patients_email ON public.patients(email);
CREATE INDEX idx_visits_patient ON public.visits(patient_id);
CREATE INDEX idx_visits_date ON public.visits(visit_date);
CREATE INDEX idx_bills_patient ON public.bills(patient_id);
CREATE INDEX idx_bills_date ON public.bills(bill_date);
CREATE INDEX idx_expenses_date ON public.expenses(expense_date);
CREATE INDEX idx_revenue_date ON public.revenue_entries(revenue_date);

-- Create functions for automatic timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamps
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_visits_updated_at
    BEFORE UPDATE ON public.visits
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bills_updated_at
    BEFORE UPDATE ON public.bills
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_revenue_updated_at
    BEFORE UPDATE ON public.revenue_entries
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate bill numbers
CREATE OR REPLACE FUNCTION public.generate_bill_number()
RETURNS TEXT AS $$
DECLARE
    bill_number TEXT;
    counter INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(bill_number FROM 'BILL-(\d+)') AS INTEGER)), 0) + 1
    INTO counter
    FROM public.bills
    WHERE bill_number ~ '^BILL-\d+$';
    
    bill_number := 'BILL-' || LPAD(counter::TEXT, 6, '0');
    RETURN bill_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate bill numbers
CREATE OR REPLACE FUNCTION public.set_bill_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.bill_number IS NULL OR NEW.bill_number = '' THEN
        NEW.bill_number := public.generate_bill_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_bill_number_trigger
    BEFORE INSERT ON public.bills
    FOR EACH ROW EXECUTE FUNCTION public.set_bill_number();

-- Insert sample data
INSERT INTO public.products (name, description, category, unit_price, stock_quantity, min_stock_level, unit) VALUES
('Paracetamol 500mg', 'Pain relief and fever reducer', 'Medication', 2.50, 100, 20, 'tablet'),
('Bandage 5cm', 'Medical bandage for wound care', 'Medical Supplies', 1.20, 50, 10, 'piece'),
('Thermometer', 'Digital thermometer for temperature measurement', 'Equipment', 15.00, 5, 2, 'piece'),
('Syringe 5ml', 'Disposable syringe for injections', 'Medical Supplies', 0.80, 200, 50, 'piece'),
('Cotton Swabs', 'Sterile cotton swabs for medical use', 'Medical Supplies', 3.50, 30, 5, 'pack');

INSERT INTO public.patients (first_name, last_name, email, phone, date_of_birth, gender, address) VALUES
('John', 'Doe', 'john.doe@email.com', '+1234567890', '1985-03-15', 'Male', '123 Main St, City, State'),
('Jane', 'Smith', 'jane.smith@email.com', '+1234567891', '1990-07-22', 'Female', '456 Oak Ave, City, State'),
('Mike', 'Johnson', 'mike.johnson@email.com', '+1234567892', '1978-11-08', 'Male', '789 Pine Rd, City, State');

-- Create a default admin profile
INSERT INTO public.profiles (id, email, full_name, role) VALUES
('00000000-0000-0000-0000-000000000000', 'admin@clinic.com', 'Admin User', 'admin');

-- Disable Row Level Security completely (for demo purposes)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_treatments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
