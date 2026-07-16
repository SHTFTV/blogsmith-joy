ALTER TABLE public.pricing_calculator_events
  ADD COLUMN IF NOT EXISTS device_type TEXT,
  ADD COLUMN IF NOT EXISTS referrer_source TEXT,
  ADD COLUMN IF NOT EXISTS attempted_city TEXT;

ALTER TABLE public.pricing_calculator_events
  DROP CONSTRAINT IF EXISTS pricing_calculator_events_event_name_check;

ALTER TABLE public.pricing_calculator_events
  ADD CONSTRAINT pricing_calculator_events_event_name_check
  CHECK (event_name IN (
    'pricing_calculator_impression',
    'pricing_calculator_form_change',
    'pricing_calculator_city_selected',
    'pricing_calculator_submit',
    'ppp_explainer_click',
    'pricing_calculator_city_fallback'
  ));

CREATE INDEX IF NOT EXISTS pricing_calc_events_device_idx
  ON public.pricing_calculator_events (device_type);
CREATE INDEX IF NOT EXISTS pricing_calc_events_referrer_idx
  ON public.pricing_calculator_events (referrer_source);
CREATE INDEX IF NOT EXISTS pricing_calc_events_city_idx
  ON public.pricing_calculator_events (city);