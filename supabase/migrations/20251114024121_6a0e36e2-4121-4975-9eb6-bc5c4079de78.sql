-- Add missing columns for HF model inputs
ALTER TABLE loan_applications 
ADD COLUMN IF NOT EXISTS residential_assets_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS commercial_assets_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS luxury_assets_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS prediction_method TEXT DEFAULT 'ai_fallback';

-- Add comment for clarity
COMMENT ON COLUMN loan_applications.residential_assets_value IS 'Value of residential assets owned by applicant';
COMMENT ON COLUMN loan_applications.commercial_assets_value IS 'Value of commercial assets owned by applicant';
COMMENT ON COLUMN loan_applications.luxury_assets_value IS 'Value of luxury assets owned by applicant';
COMMENT ON COLUMN loan_applications.prediction_method IS 'Method used for prediction: huggingface or ai_fallback';