import { defineMcp } from "@lovable.dev/mcp-js";
import listProblemsTool from "./tools/list-problems";
import listResearchTool from "./tools/list-research";
import analyzeEntryTool from "./tools/analyze-entry";

export default defineMcp({
  name: "africa-opportunity-hub",
  title: "Africa Opportunity Hub",
  version: "0.1.0",
  instructions:
    "Tools for the Africa Opportunity Map. Use `list_problems` to search mapped African problems by country, category or keyword, `list_research` for the research library, and `analyze_entry` to get a Nuru AI specialist breakdown (root drivers, opportunity, who should build it, first 90 days) of a problem or research entry. All data is public.",
  tools: [listProblemsTool, listResearchTool, analyzeEntryTool],
});
