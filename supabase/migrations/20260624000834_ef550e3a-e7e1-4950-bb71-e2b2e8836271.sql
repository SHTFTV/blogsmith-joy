CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  owner_name TEXT,
  photo_url TEXT,
  city TEXT,
  category TEXT,
  specialty TEXT,
  website TEXT,
  instagram TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  talc_posts INTEGER NOT NULL DEFAULT 0,
  referral_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vendors TO anon;
GRANT SELECT ON public.vendors TO authenticated;
GRANT ALL ON public.vendors TO service_role;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendors are publicly viewable" ON public.vendors FOR SELECT USING (true);

INSERT INTO public.vendors (slug, business_name, owner_name, photo_url, city, category, specialty, website, instagram, verified, talc_posts)
VALUES (
  'sandhu-events-co',
  'Sandhu Events Co.',
  'Harpreet Sandhu',
  'https://api.dicebear.com/7.x/initials/svg?seed=Sandhu%20Events%20Co',
  'Brampton, ON',
  'Wedding Planner',
  'Multi-day Sikh and Punjabi-Hindu weddings. Specializes in 800+ guest mandaps, Anand Karaj coordination, and same-day Sangeet-to-Reception flips.',
  'https://example.com',
  '@sandhueventsco',
  true,
  47
);