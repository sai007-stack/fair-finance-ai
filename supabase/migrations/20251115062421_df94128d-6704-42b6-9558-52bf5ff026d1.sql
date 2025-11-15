-- Create storage bucket for loan documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'loan-documents',
  'loan-documents',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
);

-- Create RLS policies for loan documents bucket
CREATE POLICY "Users can upload their own documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'loan-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'loan-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Employees can view all documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'loan-documents' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'employee'
  )
);

-- Create table to track uploaded documents
CREATE TABLE public.loan_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id uuid NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  extracted_text text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on loan_documents
ALTER TABLE public.loan_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for loan_documents
CREATE POLICY "Users can view their own loan documents"
ON public.loan_documents
FOR SELECT
USING (true);

CREATE POLICY "System can insert loan documents"
ON public.loan_documents
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Employees can view all loan documents"
ON public.loan_documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'employee'
  )
);