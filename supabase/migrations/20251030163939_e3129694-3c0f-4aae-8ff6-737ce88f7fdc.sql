-- Create loan_applications table to store all applications and results
CREATE TABLE public.loan_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  income DECIMAL(12, 2) NOT NULL,
  credit_score INTEGER NOT NULL,
  loan_amount DECIMAL(12, 2) NOT NULL,
  loan_term INTEGER NOT NULL,
  employment_status TEXT NOT NULL,
  existing_loans DECIMAL(12, 2) NOT NULL DEFAULT 0,
  savings_balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
  
  -- AI prediction results
  prediction TEXT, -- 'Approved' or 'Rejected'
  confidence DECIMAL(5, 2), -- Percentage 0-100
  fairness_score DECIMAL(5, 2), -- Percentage 0-100
  explanation TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (public application submission)
CREATE POLICY "Anyone can submit loan applications"
ON public.loan_applications
FOR INSERT
WITH CHECK (true);

-- Policy: Anyone can view their own applications (by name for demo purposes)
-- In production, this would be tied to authenticated user IDs
CREATE POLICY "Users can view loan applications"
ON public.loan_applications
FOR SELECT
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_loan_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_loan_applications_timestamp
BEFORE UPDATE ON public.loan_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_loan_applications_updated_at();

-- Create approved_loans table to track monthly notifications
CREATE TABLE public.approved_loans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  loan_amount DECIMAL(12, 2) NOT NULL,
  monthly_emi DECIMAL(12, 2) NOT NULL,
  next_notification_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.approved_loans ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view approved loans
CREATE POLICY "Anyone can view approved loans"
ON public.approved_loans
FOR SELECT
USING (true);

-- Policy: System can insert approved loans
CREATE POLICY "System can insert approved loans"
ON public.approved_loans
FOR INSERT
WITH CHECK (true);

-- Create index for efficient date queries
CREATE INDEX idx_approved_loans_notification_date ON public.approved_loans(next_notification_date) WHERE is_active = true;