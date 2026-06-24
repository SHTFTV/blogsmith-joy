ALTER TABLE public.vendors
  ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN culture text;

CREATE INDEX vendors_user_id_idx ON public.vendors(user_id);
CREATE INDEX vendors_city_idx ON public.vendors(city);
CREATE INDEX vendors_category_idx ON public.vendors(category);
CREATE INDEX vendors_culture_idx ON public.vendors(culture);

CREATE TABLE public.territories (
  city text PRIMARY KEY,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  country text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.territories TO anon;
GRANT SELECT ON public.territories TO authenticated;
GRANT ALL ON public.territories TO service_role;
ALTER TABLE public.territories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Territories are publicly viewable" ON public.territories FOR SELECT USING (true);

INSERT INTO public.territories (city, latitude, longitude, country) VALUES
  ('Brampton, ON', 43.7315, -79.7624, 'Canada');

GRANT UPDATE ON public.vendors TO authenticated;
CREATE POLICY "Vendors can update own profile" ON public.vendors
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

UPDATE public.vendors SET culture = 'South Asian' WHERE slug = 'sandhu-events-co';