import type { MarkdownAstroData } from "@astrojs/markdown-remark";
import type { Data } from "vfile";

function isValidAstroData(obj: unknown): obj is MarkdownAstroData {
  if (typeof obj === "object" && obj !== null && "frontmatter" in obj) {
    const { frontmatter } = obj;
    try {
      // ensure frontmatter is JSON-serializable
      JSON.stringify(obj.frontmatter);
    } catch {
      return false;
    }
    return typeof frontmatter === "object" && frontmatter !== null;
  }
  return false;
}

export function safelyGetAstroData(vfileData: Data): MarkdownAstroData {
  const { astro } = vfileData;

  if (!astro) return { frontmatter: {} };
  if (!isValidAstroData(astro)) {
    throw Error(
      `A remark or rehype plugin tried to add invalid frontmatter. Ensure "astro.frontmatter" is a JSON object!`
    );
  }

  return astro;
}
