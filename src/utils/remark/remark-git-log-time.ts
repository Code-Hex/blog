import type { Root } from "mdast";
import type { Plugin } from "unified";
import { safelyGetAstroData } from "./astro-data";
import { execSync } from "child_process";

type RemarkPlugin<PluginParameters extends unknown[] = unknown[]> = Plugin<
  PluginParameters,
  Root
>;

export const remarkGitLogTime: RemarkPlugin = () => {
  return function (_tree, { data, history }) {
    const filepath = history[0];
    const createdAt = execSync(
      `git log --follow --pretty="format:%cI" --date default "${filepath}"  | tail -1`
    );
    const lastModified = execSync(
      `git log -1 --pretty="format:%cI" "${filepath}"`
    );
    const astroData = safelyGetAstroData(data);
    astroData.frontmatter.gitCreatedAt = createdAt;
    astroData.frontmatter.gitLastModified = lastModified;
  };
};
