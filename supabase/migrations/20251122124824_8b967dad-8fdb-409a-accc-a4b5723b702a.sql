-- Make handle_new_user_role idempotent to avoid duplicate key errors on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, (NEW.raw_user_meta_data->>'role')::app_role)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$function$;