
CREATE TABLE public.pricing_calculator_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL CHECK (event_name IN (
    'pricing_calculator_impression',
    'pricing_calculator_form_change',
    'pricing_calculator_city_selected',
    'pricing_calculator_submit',
    'ppp_explainer_click'
  )),
  session_id TEXT NOT NULL,
  entry_page TEXT,
  location TEXT,
  source TEXT,
  destination TEXT,
  city TEXT,
  country TEXT,
  ppp NUMERIC,
  monthly_usd INTEGER,
  change_count INTEGER,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX pricing_calc_events_created_idx ON public.pricing_calculator_events (created_at DESC);
CREATE INDEX pricing_calc_events_entry_page_idx ON public.pricing_calculator_events (entry_page);
CREATE INDEX pricing_calc_events_event_name_idx ON public.pricing_calculator_events (event_name);
CREATE INDEX pricing_calc_events_session_idx ON public.pricing_calculator_events (session_id);

GRANT INSERT ON public.pricing_calculator_events TO anon, authenticated;
GRANT SELECT ON public.pricing_calculator_events TO authenticated;
GRANT ALL ON public.pricing_calculator_events TO service_role;

ALTER TABLE public.pricing_calculator_events ENABLE ROW LEVEL SECURITY;

-- Anyone (visitors) can insert events. No PII is required.
CREATE POLICY "Anyone can insert pricing calculator events"
  ON public.pricing_calculator_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read the raw event stream.
CREATE POLICY "Admins can read pricing calculator events"
  ON public.pricing_calculator_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
