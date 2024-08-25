import { slugifyStr } from "@utils/slugify";
import Datetime from "./Datetime";
import type { CollectionEntry } from "astro:content";

export default function ExternalLink({
  collection,
  data,
}: CollectionEntry<"zenn">) {
  const { title, pubDatetime, link } = data;

  const headerProps = {
    style: { viewTransitionName: slugifyStr(title) },
    className: "text-lg font-medium decoration-dashed hover:underline",
  };

  return (
    <li className="my-6">
      <a
        href={link}
        className="inline-block text-lg font-medium text-skin-accent decoration-dashed underline-offset-4 focus-visible:no-underline focus-visible:underline-offset-0"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="flex flex-row items-start">
          <h2 {...headerProps}>{title}</h2>
          {/* https://icones.js.org/collection/carbon?s=arrow&icon=carbon:arrow-up-right */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 32 32"
            className="h-4 w-4 flex-none opacity-50"
          >
            <path
              fill="currentColor"
              d="M10 6v2h12.59L6 24.59L7.41 26L24 9.41V22h2V6z"
            />
          </svg>
        </div>
      </a>
      <div className="flex w-full flex-row items-center space-x-2">
        <span className="opacity-80">{collection}</span>
        <Datetime pubDatetime={pubDatetime} />
      </div>
    </li>
  );
}
