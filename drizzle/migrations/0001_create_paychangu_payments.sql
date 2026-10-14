-- Paychangu checkout payment records (webhook + verification source of truth)
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_slug text NOT NULL,
  tx_ref text NOT NULL UNIQUE,
  charge_id text,
  amount numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  provider text NOT NULL DEFAULT 'paychangu',
  mode text NOT NULL DEFAULT 'live',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','success','failed')),
  checkout_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX payments_user_created_idx ON public.payments (user_id, created_at DESC);

GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read their own payment records" ON public.payments
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();