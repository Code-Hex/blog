import getReadingTime from "reading-time";
import { toString } from "mdast-util-to-string";
import type { Root } from "mdast";
import type { Plugin } from "unified";
import { safelyGetAstroData } from "./astro-data";

type RemarkPlugin<PluginParameters extends unknown[] = unknown[]> = Plugin<
  PluginParameters,
  Root
>;

export const remarkReadingTime: RemarkPlugin = () => {
  return function (tree, { data }) {
    const textOnPage = toString(tree);
    const readingTime = getReadingTime(textOnPage);
    // readingTime.text will give us minutes read as a friendly string,
    // i.e. "3 min read"
    const astroData = safelyGetAstroData(data);
    astroData.frontmatter.minutesRead = `${Math.round(readingTime.minutes)}min`;
  };
};
