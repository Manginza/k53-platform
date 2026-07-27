-- Insert Thompo Driving School (Pretoria & Johannesburg)
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run

INSERT INTO public.driving_schools (name, province, suburb, address, phone, email, licence_codes, hours, lat, lng, is_verified)
VALUES
  (
    'Thompo Driving School',
    'Gauteng',
    'Sunnyside',
    '81 Celliers St, Sunnyside, Pretoria, 0002 · Adverto Tower',
    '012 772 1616',
    NULL,
    ARRAY['Code 8', 'Code 10'],
    'Mon–Fri 8am–5pm, Sat 8am–1pm',
    -25.7560,
    28.2050,
    true
  )
ON CONFLICT DO NOTHING;
