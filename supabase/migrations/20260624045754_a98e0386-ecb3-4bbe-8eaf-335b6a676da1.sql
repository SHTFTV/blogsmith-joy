-- IAM TERRITORY PRICING — THE 250 SCALE

ALTER TABLE public.territories
  ADD COLUMN IF NOT EXISTS population INTEGER,
  ADD COLUMN IF NOT EXISTS max_slots INTEGER,
  ADD COLUMN IF NOT EXISTS price_per_slot INTEGER,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION public.calculate_slot_count(population INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  IF population IS NULL OR population < 250000 THEN RETURN 3;
  ELSIF population < 300000 THEN RETURN 4;
  ELSIF population < 500000 THEN RETURN 4;
  ELSIF population < 600000 THEN RETURN 6;
  ELSIF population < 700000 THEN RETURN 7;
  ELSIF population < 1000000 THEN RETURN 9;
  ELSE RETURN 10;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_slot_price(population INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  IF population IS NULL OR population < 1000000 THEN RETURN 10;
  ELSIF population < 2000000 THEN RETURN 20;
  ELSIF population < 3000000 THEN RETURN 30;
  ELSIF population < 4000000 THEN RETURN 40;
  ELSE RETURN 50;
  END IF;
END;
$$;

UPDATE public.territories SET
  max_slots = public.calculate_slot_count(population),
  price_per_slot = public.calculate_slot_price(population),
  updated_at = now();