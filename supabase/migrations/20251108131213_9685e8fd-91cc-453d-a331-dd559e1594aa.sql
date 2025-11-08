-- Add new fields to loan_applications table
ALTER TABLE public.loan_applications 
ADD COLUMN age integer,
ADD COLUMN gender text,
ADD COLUMN loan_purpose text;

-- Add check constraint for age
ALTER TABLE public.loan_applications 
ADD CONSTRAINT age_range CHECK (age >= 18 AND age <= 100);