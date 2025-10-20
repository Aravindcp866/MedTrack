-- Add patient_name column to bills table
ALTER TABLE public.bills 
ADD COLUMN patient_name TEXT;

-- Update existing bills with patient names
UPDATE public.bills 
SET patient_name = CONCAT(p.first_name, ' ', p.last_name)
FROM public.patients p 
WHERE bills.patient_id = p.id;

-- Create index for better performance
CREATE INDEX idx_bills_patient_name ON public.bills(patient_name);

-- Update the bill number generation to include patient name
CREATE OR REPLACE FUNCTION generate_bill_number()
RETURNS TEXT AS $$
DECLARE
    patient_name TEXT;
    bill_count INTEGER;
    bill_number TEXT;
BEGIN
    -- Get the patient name from the most recent visit
    SELECT CONCAT(p.first_name, ' ', p.last_name) INTO patient_name
    FROM public.visits v
    JOIN public.patients p ON v.patient_id = p.id
    ORDER BY v.created_at DESC
    LIMIT 1;
    
    -- Get count of bills for this patient
    SELECT COUNT(*) INTO bill_count
    FROM public.bills
    WHERE patient_name = patient_name;
    
    -- Generate bill number: PatientName-Bill-001, PatientName-Bill-002, etc.
    bill_number := CONCAT(
        REPLACE(patient_name, ' ', ''), 
        '-Bill-', 
        LPAD((bill_count + 1)::TEXT, 3, '0')
    );
    
    RETURN bill_number;
END;
$$ LANGUAGE plpgsql;
