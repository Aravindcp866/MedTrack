-- Security Updates for ClinicSync Database
-- Add Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'doctor', 'staff')),
    permissions TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    details JSONB DEFAULT '{}'
);

-- RLS Policies for Patients
CREATE POLICY "Admins can access all patients" ON public.patients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Doctors can access all patients" ON public.patients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'doctor'
        )
    );

CREATE POLICY "Staff can read patients" ON public.patients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'staff'
        )
    );

-- RLS Policies for Bills
CREATE POLICY "Admins can access all bills" ON public.bills
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Doctors can access all bills" ON public.bills
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'doctor'
        )
    );

CREATE POLICY "Staff can read bills" ON public.bills
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'staff'
        )
    );

-- RLS Policies for Products/Inventory
CREATE POLICY "Admins can access all products" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Doctors can read products" ON public.products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'doctor'
        )
    );

CREATE POLICY "Staff can read products" ON public.products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'staff'
        )
    );

-- RLS Policies for Expenses
CREATE POLICY "Admins can access all expenses" ON public.expenses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Doctors can read expenses" ON public.expenses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'doctor'
        )
    );

CREATE POLICY "Staff can read expenses" ON public.expenses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'staff'
        )
    );

-- RLS Policies for Revenue
CREATE POLICY "Admins can access all revenue" ON public.revenue_entries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Doctors can read revenue" ON public.revenue_entries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'doctor'
        )
    );

CREATE POLICY "Staff can read revenue" ON public.revenue_entries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'staff'
        )
    );

-- RLS Policies for Visits
CREATE POLICY "Admins can access all visits" ON public.visits
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Doctors can access all visits" ON public.visits
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'doctor'
        )
    );

CREATE POLICY "Staff can read visits" ON public.visits
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'staff'
        )
    );

-- RLS Policies for Bill Items
CREATE POLICY "Admins can access all bill_items" ON public.bill_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Doctors can access all bill_items" ON public.bill_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'doctor'
        )
    );

CREATE POLICY "Staff can read bill_items" ON public.bill_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'staff'
        )
    );

-- RLS Policies for Visit Treatments
CREATE POLICY "Admins can access all visit_treatments" ON public.visit_treatments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Doctors can access all visit_treatments" ON public.visit_treatments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'doctor'
        )
    );

CREATE POLICY "Staff can read visit_treatments" ON public.visit_treatments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'staff'
        )
    );

-- RLS Policies for Notifications
CREATE POLICY "Users can access their own notifications" ON public.notifications
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for Profiles
CREATE POLICY "Users can access their own profile" ON public.profiles
    FOR ALL USING (id = auth.uid());

-- RLS Policies for User Roles
CREATE POLICY "Admins can manage user roles" ON public.user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for Audit Logs
CREATE POLICY "Admins can access audit logs" ON public.audit_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- Create function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
    p_user_id UUID,
    p_action TEXT,
    p_resource TEXT,
    p_resource_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT '{}'::JSONB
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.audit_logs (
        user_id, action, resource, resource_id, details
    ) VALUES (
        p_user_id, p_action, p_resource, p_resource_id, p_details
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TEXT[] AS $$
DECLARE
    user_role TEXT;
    permissions TEXT[];
BEGIN
    SELECT role INTO user_role FROM public.user_roles WHERE user_id = p_user_id;
    
    CASE user_role
        WHEN 'admin' THEN permissions := ARRAY['read:patients', 'write:patients', 'delete:patients', 'read:bills', 'write:bills', 'delete:bills', 'read:inventory', 'write:inventory', 'delete:inventory', 'read:revenue', 'read:expenses', 'write:expenses', 'delete:expenses', 'admin:access'];
        WHEN 'doctor' THEN permissions := ARRAY['read:patients', 'write:patients', 'read:bills', 'write:bills', 'read:inventory', 'read:revenue', 'read:expenses'];
        WHEN 'staff' THEN permissions := ARRAY['read:patients', 'read:bills', 'read:inventory', 'read:revenue', 'read:expenses'];
        ELSE permissions := ARRAY[]::TEXT[];
    END CASE;
    
    RETURN permissions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
