import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listProblemsTool from "./tools/list-problems";
import listResearchTool from "./tools/list-research";
import getEcosystemTool from "./tools/get-ecosystem";

const SUPABASE_URL = import.meta.env["VITE_SUPABASE_URL"] as string;

export default defineMcp({
  name: "africa-opportunity-hub",
  title: "Africa Opportunity Hub",
  version: "0.2.0",
  auth: auth.oauth.issuer({
    issuer: `${SUPABASE_URL}/auth/v1`,
    jwksUri: `${SUPABASE_URL}/auth/v1/.well-known/jwks.json`,
    acceptedAudiences: ["authenticated"],
    resourceName: "Africa Opportunity Hub",
  }),
  instructions:
    "Tools for Nuru AI and the Africa Opportunity Map. Call `get_ecosystem` first to learn the live state of the Nuru AI ecosystem (AI departments, supported African languages, Business Hub sectors and corridors, and real-time counts of mapped problems and research). Use `list_problems` to search mapped African problems by country, category or keyword, and `list_research` for the research library. All tools are read-only and return only public records.",
  tools: [getEcosystemTool, listProblemsTool, listResearchTool],
});

