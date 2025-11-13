-- Create appeals table
CREATE TABLE public.appeals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  loan_id UUID NOT NULL REFERENCES public.loan_applications(id),
  reason_codes JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed')),
  review_comment TEXT,
  final_decision TEXT CHECK (final_decision IN ('approved_after_review', 'rejected_ai_stands')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.appeals ENABLE ROW LEVEL SECURITY;

-- RLS policies for appeals
CREATE POLICY "Users can view their own appeals" 
  ON public.appeals 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create appeals" 
  ON public.appeals 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "System can update appeals" 
  ON public.appeals 
  FOR UPDATE 
  USING (true);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (true);

-- Add indexes for better performance
CREATE INDEX idx_appeals_user_id ON public.appeals(user_id);
CREATE INDEX idx_appeals_loan_id ON public.appeals(loan_id);
CREATE INDEX idx_appeals_status ON public.appeals(status);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);