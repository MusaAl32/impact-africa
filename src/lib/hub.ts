export type Sector = {
  id: string;
  name: string;
  summary: string;
  markets: string[];
  signals: string[];
  prompt: string;
};

export const SECTORS: Sector[] = [
  {
    id: "agrifood",
    name: "Agriculture & Food Processing",
    summary:
      "Primary production is strong; value addition, storage and cold chain remain the gap across most markets.",
    markets: ["Nigeria", "Kenya", "Tanzania", "Malawi", "Zambia"],
    signals: ["Post-harvest loss", "Contract farming", "Input financing", "Export certification"],
    prompt:
      "Build me an agri-processing business plan for my country: product choice, equipment, unit economics and buyers.",
  },
  {
    id: "fintech",
    name: "Fintech & Mobile Money",
    summary:
      "Mobile money rails are mature in East Africa and scaling in West Africa; opportunity sits in credit, payouts and merchant tooling.",
    markets: ["Kenya", "Ghana", "Nigeria", "Uganda", "Senegal"],
    signals: ["Merchant acquiring", "Cross-border payouts", "Licensing", "Agent networks"],
    prompt:
      "Explain what licences and partners I need to launch a merchant payments product in my market.",
  },
  {
    id: "energy",
    name: "Energy & Solar",
    summary:
      "Off-grid solar, mini-grids and productive-use appliances continue to grow with pay-as-you-go financing.",
    markets: ["Nigeria", "Ethiopia", "Kenya", "DRC", "Zambia"],
    signals: ["PAYGo financing", "Mini-grids", "Cold storage", "Import duty regimes"],
    prompt: "Model a pay-as-you-go solar business for rural customers, including default risk.",
  },
  {
    id: "logistics",
    name: "Logistics & Trade",
    summary:
      "AfCFTA corridors, informal cross-border trade and last-mile delivery all need better coordination and documentation.",
    markets: ["Kenya-Uganda", "Nigeria-Benin", "SADC corridor", "North Africa-EU"],
    signals: ["AfCFTA rules of origin", "Customs digitisation", "Warehousing", "Last mile"],
    prompt: "Walk me through exporting my product to a neighbouring country under AfCFTA.",
  },
  {
    id: "health",
    name: "Health & Pharma",
    summary:
      "Local manufacturing, diagnostics and supply-chain integrity are priority areas with public and donor demand.",
    markets: ["Egypt", "South Africa", "Rwanda", "Ghana"],
    signals: ["Local manufacturing", "Diagnostics", "Regulatory approval", "Supply integrity"],
    prompt: "Outline the regulatory pathway to distribute a diagnostic device in my country.",
  },
  {
    id: "education",
    name: "Education & Skills",
    summary:
      "Vocational skills, exam preparation and local-language learning content have the clearest willingness to pay.",
    markets: ["Nigeria", "Kenya", "South Africa", "Morocco"],
    signals: ["Exam prep", "Vocational training", "Local-language content", "Employer partnerships"],
    prompt: "Design a vocational training programme with pricing and an employer pipeline.",
  },
  {
    id: "creative",
    name: "Creative & Digital Media",
    summary:
      "Music, film, gaming and digital content export well; the constraint is rights management and distribution.",
    markets: ["Nigeria", "South Africa", "Kenya", "Egypt"],
    signals: ["Rights management", "Streaming payouts", "Brand partnerships", "Diaspora audiences"],
    prompt: "Create a 90-day launch plan for a creative studio serving diaspora audiences.",
  },
  {
    id: "minerals",
    name: "Minerals & Manufacturing",
    summary:
      "Beneficiation and light manufacturing are policy priorities, with growing demand for battery and construction inputs.",
    markets: ["DRC", "Zambia", "Zimbabwe", "Guinea", "Morocco"],
    signals: ["Beneficiation policy", "Battery inputs", "Local content rules", "Industrial parks"],
    prompt: "Assess a light manufacturing opportunity using locally available raw materials.",
  },
];

export type Corridor = {
  route: string;
  note: string;
};

export const CORRIDORS: Corridor[] = [
  { route: "Lagos ↔ Accra", note: "Consumer goods and fintech expansion along the West African coastal corridor." },
  { route: "Nairobi ↔ Kampala ↔ Kigali", note: "Fast-moving goods, agri inputs and cross-border mobile money." },
  { route: "Johannesburg ↔ Lusaka ↔ Lubumbashi", note: "Mining supply chain, equipment and industrial services." },
  { route: "Cairo ↔ Nairobi", note: "Pharma, manufacturing inputs and air-freighted perishables." },
  { route: "Dakar ↔ Abidjan", note: "Agri-processing, logistics and regional retail expansion." },
  { route: "Africa ↔ Diaspora", note: "Remittances, creative exports and diaspora-funded ventures." },
];
