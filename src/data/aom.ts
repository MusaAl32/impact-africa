export type Status = "available" | "development" | "soon";

export const STATUS_LABEL: Record<Status, string> = {
  available: "Available Now",
  development: "In Development",
  soon: "Coming Soon",
};

export const CATEGORIES = [
  { emoji: "💼", name: "Jobs & Entrepreneurship", slug: "jobs-entrepreneurship", desc: "Employment, informal economy, skills and entrepreneurship." },
  { emoji: "📚", name: "Education", slug: "education", desc: "Learning access, quality education, skills and digital education." },
  { emoji: "🌾", name: "Agriculture & Food", slug: "agriculture-food", desc: "Farmers, markets, food security and agricultural technology." },
  { emoji: "🏥", name: "Healthcare", slug: "healthcare", desc: "Healthcare access, information, technology and infrastructure." },
  { emoji: "⚡", name: "Energy", slug: "energy", desc: "Electricity access, renewable energy and energy intelligence." },
  { emoji: "💧", name: "Water", slug: "water", desc: "Water access, infrastructure, monitoring and climate resilience." },
  { emoji: "🌡️", name: "Climate", slug: "climate", desc: "Climate adaptation, disaster resilience and environmental technology." },
  { emoji: "💰", name: "Financial Inclusion", slug: "financial-inclusion", desc: "Financial access, small businesses and digital finance." },
  { emoji: "🗣️", name: "African Languages", slug: "african-languages", desc: "Language technology, voice AI, translation and local digital access." },
  { emoji: "🌐", name: "Digital Access", slug: "digital-access", desc: "Internet, devices, connectivity and digital inclusion." },
  { emoji: "🏛️", name: "Public Services", slug: "public-services", desc: "Government access, digital services and civic technology." },
  { emoji: "🚚", name: "Trade & Logistics", slug: "trade-logistics", desc: "African markets, transportation and cross-border trade." },
];

export type Problem = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  sector: string;
  countries: string[];
  affected: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  urgency: "Low" | "Medium" | "High" | "Critical";
  evidence: string[];
  sources: { label: string; org: string }[];
  existingSolutions: string[];
  organizations: string[];
  startups: string[];
  techOpportunities: string[];
  data: string[];
  partners: string[];
  funding: string[];
  score: number;
  related: string[];
  projects: string[];
};

export const PROBLEMS: Problem[] = [
  {
    slug: "african-youth-unemployment",
    title: "African Youth Unemployment",
    summary:
      "Millions of young Africans enter the labour market each year without matching job creation, formal pathways or verified skills signals.",
    description:
      "Africa adds roughly 10–12 million young people to the labour market annually while formal economies create a fraction of that number of jobs. The gap is compounded by weak school-to-work transition systems, no portable proof of skills, employer distrust of informal experience, and hiring markets concentrated in a few urban centres. The result is large-scale underemployment inside the informal economy rather than visible unemployment alone.",
    sector: "Jobs & Entrepreneurship",
    countries: ["Nigeria", "Kenya", "South Africa", "Egypt", "Ghana", "Ethiopia"],
    affected: "200M+ young people",
    severity: "Critical",
    urgency: "Critical",
    evidence: [
      "Youth make up over 60% of Africa's unemployed population.",
      "Formal job creation covers well under a third of new labour-market entrants.",
      "Informal employment accounts for the majority of youth work across the continent.",
    ],
    sources: [
      { label: "Africa's Pulse — labour market outlook", org: "World Bank" },
      { label: "Jobs for Youth in Africa strategy", org: "African Development Bank" },
      { label: "Agenda 2063 youth employment priorities", org: "African Union" },
    ],
    existingSolutions: ["Digital skills bootcamps", "Gig and outsourcing marketplaces", "Public works programmes"],
    organizations: ["African Development Bank", "ILO Africa", "Mastercard Foundation"],
    startups: ["Talent marketplaces", "Skills verification platforms", "Remote-work enablers"],
    techOpportunities: [
      "AI skills-matching between informal experience and employer demand",
      "Verifiable credential infrastructure for non-degree skills",
      "Low-bandwidth learning and assessment delivery",
    ],
    data: ["National labour force surveys", "Mobile money transaction proxies", "Job board posting data"],
    partners: ["Universities", "Technical training institutes", "Employer associations", "Telecom operators"],
    funding: ["Development finance institutions", "Youth employment funds", "Impact venture capital"],
    score: 94,
    related: ["digital-skills-gap", "smallholder-market-access"],
    projects: ["Skills passport infrastructure", "AI career navigator for informal workers"],
  },
  {
    slug: "smallholder-market-access",
    title: "Smallholder Farmer Market Access",
    summary:
      "Farmers lack reliable price discovery and buyer access, losing income to intermediaries and post-harvest waste.",
    description:
      "Smallholders produce the majority of Africa's food but sell into opaque markets. Without real-time price information, aggregation logistics or credible buyer relationships, farmers accept farm-gate prices far below market value and lose a significant share of perishable output before sale. Language and literacy barriers make text-first digital tools ineffective for a large part of this population.",
    sector: "Agriculture & Food",
    countries: ["Nigeria", "Kenya", "Ghana", "Tanzania", "Uganda", "Côte d'Ivoire"],
    affected: "60M+ farming households",
    severity: "High",
    urgency: "High",
    evidence: [
      "Post-harvest losses for perishables regularly reach 30–40%.",
      "Farm-gate prices are often less than half of urban market prices.",
      "Most smallholders rely on word-of-mouth for price information.",
    ],
    sources: [
      { label: "Africa Agriculture Status Report", org: "AGRA" },
      { label: "Rural income and value chain studies", org: "World Bank" },
      { label: "CAADP implementation reports", org: "African Union" },
    ],
    existingSolutions: ["SMS price alerts", "Cooperative aggregation", "Digital produce marketplaces"],
    organizations: ["FAO", "AGRA", "National agricultural extension services"],
    startups: ["Produce marketplaces", "Cold-chain operators", "Agri-fintech lenders"],
    techOpportunities: [
      "Voice-first market intelligence in local languages",
      "AI demand forecasting for perishables",
      "Shared cold-chain and logistics coordination",
    ],
    data: ["Market price boards", "Satellite crop imagery", "Mobile money flows", "Weather station data"],
    partners: ["Cooperatives", "Telecoms", "Agricultural research institutes", "Food processors"],
    funding: ["Agri-tech venture funds", "Climate finance", "Development grants"],
    score: 91,
    related: ["african-youth-unemployment", "unreliable-electricity"],
    projects: ["Voice market intelligence assistant", "Regional cold-chain coordination network"],
  },
  {
    slug: "unreliable-electricity",
    title: "Unreliable and Unavailable Electricity",
    summary:
      "Hundreds of millions live without grid access, and connected users face outages that suppress productivity and enterprise growth.",
    description:
      "Electricity access is both a coverage problem and a reliability problem. Unserved rural populations depend on costly alternatives, while connected businesses budget for diesel generators and equipment damage. Utilities lack granular consumption and fault data, making planning reactive. Distributed generation is growing but financing, monitoring and maintenance infrastructure remain thin.",
    sector: "Energy",
    countries: ["Nigeria", "DR Congo", "Ethiopia", "Tanzania", "Zambia", "South Africa"],
    affected: "600M+ people",
    severity: "Critical",
    urgency: "High",
    evidence: [
      "Roughly half the continent's population lacks reliable electricity access.",
      "Businesses report outages as a top constraint on operations.",
      "Off-grid solar has scaled fastest where pay-as-you-go financing exists.",
    ],
    sources: [
      { label: "Africa Energy Outlook", org: "International Energy Agency" },
      { label: "Electrification programme reviews", org: "World Bank" },
      { label: "Desert to Power programme", org: "African Development Bank" },
    ],
    existingSolutions: ["Pay-as-you-go solar home systems", "Mini-grids", "Grid extension programmes"],
    organizations: ["Rural electrification agencies", "IEA", "Power utilities"],
    startups: ["PAYG solar providers", "Mini-grid operators", "Energy IoT vendors"],
    techOpportunities: [
      "Grid and mini-grid analytics for outage prediction",
      "Remote asset monitoring for distributed generation",
      "Energy credit scoring from payment histories",
    ],
    data: ["Utility outage logs", "Satellite night-lights", "Meter telemetry", "Payment records"],
    partners: ["Utilities", "Regulators", "Equipment manufacturers", "Local installers"],
    funding: ["Climate funds", "Infrastructure finance", "Blended finance facilities"],
    score: 89,
    related: ["smallholder-market-access", "digital-skills-gap"],
    projects: ["Grid analytics mesh", "Mini-grid maintenance intelligence"],
  },
  {
    slug: "digital-skills-gap",
    title: "Digital Skills Gap",
    summary:
      "Demand for technical talent outpaces training capacity, and existing training rarely reaches low-bandwidth or non-English learners.",
    description:
      "Employers across the continent report difficulty hiring for software, data and digital operations roles, while training capacity is concentrated in a handful of cities and delivered in formats that assume stable broadband and English fluency. Completion rates fall sharply outside urban hubs, and there is little shared infrastructure for assessing competence.",
    sector: "Education",
    countries: ["Nigeria", "Kenya", "Egypt", "Morocco", "Rwanda", "Senegal"],
    affected: "100M+ learners and workers",
    severity: "High",
    urgency: "High",
    evidence: [
      "Technical roles remain open far longer than the global average.",
      "Training capacity is concentrated in a small number of metropolitan areas.",
      "Bandwidth cost is a leading cause of course abandonment.",
    ],
    sources: [
      { label: "Digital Economy for Africa diagnostics", org: "World Bank" },
      { label: "Digital Transformation Strategy for Africa", org: "African Union" },
      { label: "Skills demand surveys", org: "Academic research" },
    ],
    existingSolutions: ["Coding academies", "Online course platforms", "Employer academies"],
    organizations: ["Universities", "Technical institutes", "Government ICT ministries"],
    startups: ["Bootcamp operators", "Assessment platforms", "Talent outsourcing firms"],
    techOpportunities: [
      "Offline-first learning delivery",
      "Adaptive assessment in local languages",
      "Employer-linked apprenticeship matching",
    ],
    data: ["Course completion telemetry", "Job posting requirements", "Assessment results"],
    partners: ["Universities", "Employers", "Telecom operators", "Government agencies"],
    funding: ["Education funds", "Corporate skilling budgets", "Development finance"],
    score: 87,
    related: ["african-youth-unemployment", "language-technology-gap"],
    projects: ["Offline-first skills platform", "Employer apprenticeship exchange"],
  },
  {
    slug: "language-technology-gap",
    title: "African Language Technology Gap",
    summary:
      "Over 2,000 African languages are largely unsupported by digital systems, excluding millions from technology built in English and French.",
    description:
      "Speech recognition, translation and text interfaces perform poorly or do not exist for most African languages. Training corpora are scarce, community datasets are fragmented, and commercial incentives are weak relative to model cost. This blocks voice-first service delivery in agriculture, health and public services precisely where it would matter most.",
    sector: "African Languages",
    countries: ["Nigeria", "Ethiopia", "Kenya", "Tanzania", "South Africa", "Senegal"],
    affected: "500M+ speakers",
    severity: "High",
    urgency: "Medium",
    evidence: [
      "The overwhelming majority of African languages have no usable speech models.",
      "Open datasets exist for only a small number of major languages.",
      "Voice interfaces outperform text for low-literacy users in field trials.",
    ],
    sources: [
      { label: "African NLP community research", org: "Academic research" },
      { label: "Digital inclusion reports", org: "World Bank" },
      { label: "Language policy frameworks", org: "African Union" },
    ],
    existingSolutions: ["Community-built corpora", "Open-source translation projects", "Regional speech datasets"],
    organizations: ["Research universities", "Open NLP collectives", "National language bodies"],
    startups: ["Voice AI vendors", "Translation services", "Localisation platforms"],
    techOpportunities: [
      "Community data collection infrastructure",
      "Low-resource speech recognition models",
      "Voice-first service delivery layers",
    ],
    data: ["Radio broadcast archives", "Community recordings", "Public parallel corpora"],
    partners: ["Universities", "Broadcasters", "Community organisations", "Cloud providers"],
    funding: ["Research grants", "AI research programmes", "Philanthropic funds"],
    score: 85,
    related: ["digital-skills-gap", "smallholder-market-access"],
    projects: ["Open speech corpus network", "Voice service delivery toolkit"],
  },
];

export type Opportunity = {
  slug: string;
  title: string;
  problemSlug: string;
  problem: string;
  sector: string;
  countries: string[];
  technology: string;
  impact: string;
  scores: {
    impact: number;
    urgency: number;
    technology: number;
    scalability: number;
    market: number;
    data: number;
    competition: number;
  };
  score: number;
  status: string;
};

export const OPPORTUNITIES: Opportunity[] = [
  {
    slug: "ai-agricultural-market-intelligence",
    title: "AI Agricultural Market Intelligence",
    problemSlug: "smallholder-market-access",
    problem: "Farmers struggle to access reliable market information.",
    sector: "Agriculture & Food",
    countries: ["Nigeria", "Ghana", "Kenya"],
    technology: "AI + Mobile + Voice + Market Data",
    impact: "60M+ farming households",
    scores: { impact: 95, urgency: 90, technology: 92, scalability: 93, market: 84, data: 80, competition: 76 },
    score: 91,
    status: "Open for Builders",
  },
  {
    slug: "grid-analytics-mesh",
    title: "Grid Analytics Mesh",
    problemSlug: "unreliable-electricity",
    problem: "Utilities and mini-grids operate without granular fault data.",
    sector: "Energy",
    countries: ["Nigeria", "Tanzania", "Zambia"],
    technology: "IoT + Telemetry + Predictive Analytics",
    impact: "600M+ people affected by unreliable power",
    scores: { impact: 92, urgency: 88, technology: 89, scalability: 86, market: 85, data: 78, competition: 82 },
    score: 88,
    status: "Open for Builders",
  },
  {
    slug: "skills-passport-infrastructure",
    title: "Skills Passport Infrastructure",
    problemSlug: "african-youth-unemployment",
    problem: "Informal experience carries no portable, verifiable proof.",
    sector: "Jobs & Entrepreneurship",
    countries: ["Nigeria", "Kenya", "South Africa"],
    technology: "Verifiable Credentials + Mobile + AI Matching",
    impact: "200M+ young workers",
    scores: { impact: 93, urgency: 91, technology: 84, scalability: 90, market: 79, data: 72, competition: 80 },
    score: 86,
    status: "Open for Builders",
  },
  {
    slug: "open-voice-corpus-network",
    title: "Open Voice Corpus Network",
    problemSlug: "language-technology-gap",
    problem: "Most African languages have no usable speech data.",
    sector: "African Languages",
    countries: ["Ethiopia", "Nigeria", "Tanzania"],
    technology: "Speech AI + Community Data Collection",
    impact: "500M+ speakers",
    scores: { impact: 88, urgency: 76, technology: 90, scalability: 87, market: 68, data: 64, competition: 88 },
    score: 83,
    status: "Open for Builders",
  },
];

export const SCORE_DIMENSIONS: { key: keyof Opportunity["scores"]; label: string; question: string }[] = [
  { key: "impact", label: "Impact", question: "How many people could benefit?" },
  { key: "urgency", label: "Urgency", question: "How serious is the problem?" },
  { key: "technology", label: "Technology Potential", question: "Can technology help solve it?" },
  { key: "scalability", label: "Scalability", question: "Can it work across countries?" },
  { key: "market", label: "Market Potential", question: "Can it become sustainable?" },
  { key: "data", label: "Data Availability", question: "Is useful data available?" },
  { key: "competition", label: "Competition", question: "How crowded is the market?" },
];

export const COUNTRIES = [
  "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde", "Cameroon",
  "Central African Republic", "Chad", "Comoros", "Congo", "Côte d'Ivoire", "DR Congo", "Djibouti",
  "Egypt", "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia", "Ghana",
  "Guinea", "Guinea-Bissau", "Kenya", "Lesotho", "Liberia", "Libya", "Madagascar", "Malawi", "Mali",
  "Mauritania", "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda",
  "São Tomé and Príncipe", "Senegal", "Seychelles", "Sierra Leone", "Somalia", "South Africa",
  "South Sudan", "Sudan", "Tanzania", "Togo", "Tunisia", "Uganda", "Zambia", "Zimbabwe",
];

export const MAP_COUNTRIES = [
  {
    name: "Nigeria",
    problems: ["Youth unemployment", "Energy reliability", "Agriculture market access", "Digital skills"],
    opportunities: ["AI skills platforms", "SME technology", "Agricultural intelligence", "Energy analytics"],
  },
  {
    name: "Kenya",
    problems: ["Water stress", "Informal sector productivity", "Climate shocks in agriculture"],
    opportunities: ["Water monitoring networks", "SME credit intelligence", "Climate-resilient agri-tech"],
  },
  {
    name: "Ethiopia",
    problems: ["Language exclusion in digital services", "Healthcare access", "Logistics costs"],
    opportunities: ["Local-language voice AI", "Rural health triage tools", "Freight coordination platforms"],
  },
  {
    name: "Ghana",
    problems: ["Post-harvest losses", "Youth underemployment", "Financial exclusion for micro-traders"],
    opportunities: ["Cold-chain coordination", "Skills marketplaces", "Micro-merchant finance"],
  },
  {
    name: "South Africa",
    problems: ["Grid instability", "Structural unemployment", "Township enterprise access"],
    opportunities: ["Energy analytics", "Workforce matching", "Township commerce infrastructure"],
  },
  {
    name: "Egypt",
    problems: ["Water scarcity", "Graduate unemployment", "Trade logistics friction"],
    opportunities: ["Irrigation intelligence", "Digital talent export", "Customs data tooling"],
  },
];

export const ROLES = [
  "Developer", "Designer", "Student", "Researcher", "Entrepreneur", "Startup", "Investor",
  "Mentor", "University", "Government Organization", "NGO", "Community Leader", "Problem Solver",
];

export const RESEARCH = [
  { title: "Africa's Pulse — Labour Market Outlook", org: "World Bank", type: "Economic research", topics: ["Jobs & Entrepreneurship", "Education"] },
  { title: "Jobs for Youth in Africa Strategy", org: "African Development Bank", type: "Strategy", topics: ["Jobs & Entrepreneurship"] },
  { title: "Agenda 2063 — The Africa We Want", org: "African Union", type: "Continental strategy", topics: ["Public Services", "Trade & Logistics"] },
  { title: "Africa Energy Outlook", org: "International Energy Agency", type: "Sector research", topics: ["Energy", "Climate"] },
  { title: "Africa Agriculture Status Report", org: "AGRA", type: "Sector research", topics: ["Agriculture & Food"] },
  { title: "Digital Transformation Strategy for Africa", org: "African Union", type: "Continental strategy", topics: ["Digital Access", "Education"] },
  { title: "Low-Resource NLP for African Languages", org: "Academic research", type: "Technical research", topics: ["African Languages"] },
  { title: "Digital Economy for Africa Diagnostics", org: "World Bank", type: "Country reports", topics: ["Digital Access", "Financial Inclusion"] },
];

export const INSIGHTS = [
  { title: "Why voice will beat text in African agriculture", category: "AI", read: "6 min", excerpt: "Literacy and language shape adoption more than device access. Voice-first design changes the addressable market." },
  { title: "Reading the energy opportunity beyond the grid", category: "Energy", read: "8 min", excerpt: "Distributed generation created a data problem before it created a coverage solution." },
  { title: "What an opportunity score should actually measure", category: "Research", read: "5 min", excerpt: "Scoring impact without scoring data availability produces projects that cannot be built." },
  { title: "Startup ecosystems outside the big four", category: "Startups", read: "7 min", excerpt: "Capital concentration hides where problem density is highest." },
  { title: "The credential problem behind youth unemployment", category: "Education", read: "6 min", excerpt: "Employers are not short of candidates. They are short of trustworthy signals." },
  { title: "Climate adaptation is an infrastructure data problem", category: "Innovation", read: "9 min", excerpt: "Adaptation funding outpaces the monitoring systems needed to direct it." },
];

export const BUILD_LOG = {
  thisWeek: ["Problem submission system", "Top problems intelligence pages", "Opportunity categories and scoring"],
  building: ["AI Opportunity Engine"],
  next: ["Builder profiles", "Solution Lab projects"],
};

export const FEATURE_STATUS: { name: string; status: Status }[] = [
  { name: "Problem submission system", status: "available" },
  { name: "Problem intelligence pages", status: "available" },
  { name: "Opportunity scoring", status: "available" },
  { name: "AI Opportunity Engine", status: "development" },
  { name: "Interactive country map", status: "development" },
  { name: "Builder network profiles", status: "soon" },
  { name: "Solution Lab projects", status: "soon" },
];
