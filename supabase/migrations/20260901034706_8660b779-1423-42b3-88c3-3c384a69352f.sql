CREATE TABLE public.aom_problems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  category TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT '',
  severity INTEGER NOT NULL DEFAULT 3,
  evidence TEXT NOT NULL DEFAULT '',
  source_url TEXT,
  opportunity_score INTEGER NOT NULL DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.aom_problems TO anon;
GRANT SELECT ON public.aom_problems TO authenticated;
GRANT ALL ON public.aom_problems TO service_role;
ALTER TABLE public.aom_problems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Problems are publicly readable" ON public.aom_problems FOR SELECT TO anon, authenticated USING (status = 'published');

CREATE TABLE public.aom_research (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  abstract TEXT NOT NULL,
  category TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Africa',
  source TEXT NOT NULL DEFAULT '',
  source_url TEXT,
  year INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.aom_research TO anon;
GRANT SELECT ON public.aom_research TO authenticated;
GRANT ALL ON public.aom_research TO service_role;
ALTER TABLE public.aom_research ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Research is publicly readable" ON public.aom_research FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.aom_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  category TEXT NOT NULL,
  country TEXT NOT NULL,
  evidence_url TEXT,
  contact_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  ai_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.aom_submissions TO anon;
GRANT SELECT, INSERT ON public.aom_submissions TO authenticated;
GRANT ALL ON public.aom_submissions TO service_role;
ALTER TABLE public.aom_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a problem" ON public.aom_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authors can read their own submissions" ON public.aom_submissions FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.aom_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  item_title TEXT NOT NULL DEFAULT '',
  department TEXT NOT NULL,
  analysis TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT '',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.aom_analyses TO anon;
GRANT SELECT, INSERT ON public.aom_analyses TO authenticated;
GRANT ALL ON public.aom_analyses TO service_role;
ALTER TABLE public.aom_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Analyses are publicly readable" ON public.aom_analyses FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Signed-in users can save analyses" ON public.aom_analyses FOR INSERT TO authenticated WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_aom_problems_updated_at BEFORE UPDATE ON public.aom_problems FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_aom_research_updated_at BEFORE UPDATE ON public.aom_research FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_aom_submissions_updated_at BEFORE UPDATE ON public.aom_submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.aom_problems (title, summary, category, country, region, severity, evidence, opportunity_score) VALUES
('Post-harvest maize losses', 'Smallholder maize farmers lose a large share of harvest to poor drying and storage before it reaches market.', 'Agriculture', 'Malawi', 'Southern Africa', 4, 'Extension reports repeatedly cite storage pests and moisture damage as the leading cause of loss.', 78),
('Cold chain gaps for vaccines', 'Rural clinics struggle to keep vaccines within safe temperature ranges due to unreliable power.', 'Health', 'Nigeria', 'West Africa', 5, 'Clinics report frequent outages and manual temperature logs with no alerting.', 84),
('Fragmented cross-border trade paperwork', 'Small traders face duplicated customs paperwork at regional borders, adding days to each trip.', 'Trade', 'Kenya', 'East Africa', 3, 'Trader associations describe repeated manual document checks at each crossing.', 71),
('Last-mile logistics costs', 'Delivery to peri-urban and rural addresses costs far more than urban delivery, limiting e-commerce reach.', 'Logistics', 'Ghana', 'West Africa', 3, 'Operators cite addressing gaps and low drop density as the main cost drivers.', 66),
('Unreliable grid power for SMEs', 'Small manufacturers lose production hours to outages and rely on costly diesel backup.', 'Energy', 'South Africa', 'Southern Africa', 4, 'Businesses report scheduled load reduction plus unplanned outages.', 80),
('Limited access to working capital', 'Informal businesses lack the records lenders require, so they borrow at very high informal rates.', 'Finance', 'Uganda', 'East Africa', 4, 'Lenders cite absent cash-flow records as the key barrier to underwriting.', 82),
('Learning materials not in local languages', 'Primary learners study in a second language before literacy is established in their first.', 'Education', 'Tanzania', 'East Africa', 3, 'Teachers report scarce local-language material beyond early grades.', 63),
('Water point downtime', 'Community boreholes stay broken for weeks because repair reporting and parts supply are informal.', 'Water', 'Zambia', 'Southern Africa', 4, 'Committees report long delays between breakdown and repair.', 69),
('Waste plastic accumulation in cities', 'Urban plastic waste is uncollected and unsorted, with little formal recycling offtake.', 'Environment', 'Egypt', 'North Africa', 3, 'Municipal collection covers only part of informal settlements.', 61),
('Skills mismatch for digital jobs', 'Graduates lack the practical tooling experience employers expect for entry-level digital roles.', 'Employment', 'Rwanda', 'East Africa', 3, 'Employers report long ramp-up times for new hires.', 65);

INSERT INTO public.aom_research (title, abstract, category, country, source, year) VALUES
('Storage technology and smallholder grain loss', 'Overview of hermetic storage adoption and its reported effect on grain quality and loss for smallholders.', 'Agriculture', 'Africa', 'Nuru research library', 2024),
('Off-grid solar for rural health facilities', 'Review of solar plus battery configurations used to power rural clinics and cold chain equipment.', 'Energy', 'Africa', 'Nuru research library', 2023),
('Digital customs and small-scale cross-border trade', 'Analysis of digital declaration pilots and their reported effect on clearance time for small traders.', 'Trade', 'East Africa', 'Nuru research library', 2024),
('Alternative credit scoring for informal businesses', 'Survey of cash-flow, mobile money and psychometric approaches to underwriting thin-file borrowers.', 'Finance', 'Africa', 'Nuru research library', 2025),
('Mother-tongue instruction and early literacy', 'Evidence review of first-language instruction in early primary grades and later learning outcomes.', 'Education', 'Africa', 'Nuru research library', 2023),
('Community water point maintenance models', 'Comparison of community, utility and pay-as-you-fetch maintenance models for rural water points.', 'Water', 'Southern Africa', 'Nuru research library', 2024);