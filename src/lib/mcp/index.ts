import { defineMcp } from "@lovable.dev/mcp-js";
import listProblemsTool from "./tools/list-problems";
import listResearchTool from "./tools/list-research";
import getEcosystemTool from "./tools/get-ecosystem";

export default defineMcp({
  name: "africa-opportunity-hub",
  title: "Africa Opportunity Hub",
  version: "0.2.0",
  instructions:
    "Tools for Nuru AI and the Africa Opportunity Map. Call `get_ecosystem` first to learn the live state of the Nuru AI ecosystem (AI departments, supported African languages, Business Hub sectors and corridors, and real-time counts of mapped problems and research). Use `list_problems` to search mapped African problems by country, category or keyword, `list_research` for the research library, and `analyze_entry` to get a Nuru AI specialist breakdown of a problem or research entry. All data is public and read-only.",
  tools: [getEcosystemTool, listProblemsTool, listResearchTool, analyzeEntryTool],
});

