CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS TEXT AS $$
DECLARE
  role TEXT;
BEGIN
  SELECT role INTO role FROM public.users WHERE id = user_id;
  RETURN role;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

ALTER TABLE auth.users
ADD COLUMN IF NOT EXISTS custom_claims JSONB;

CREATE OR REPLACE FUNCTION public.on_user_updated()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET custom_claims = jsonb_set(
    COALESCE(custom_claims, '{}'::jsonb),
    '{custom_role}',
    to_jsonb(new.role::text)
  )
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_public_user_updated
  AFTER UPDATE OF role ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.on_user_updated();
