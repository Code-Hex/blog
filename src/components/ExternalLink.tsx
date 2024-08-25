import { slugifyStr } from "@utils/slugify";
import Datetime from "./Datetime";
import type { CollectionEntry, CollectionKey } from "astro:content";
import type { FC } from "react";

const Collection: FC<{ collection: Exclude<CollectionKey, "blog"> }> = () => {
  return (
    <div className="flex flex-row items-center space-x-2 opacity-80">
      {/* https://simpleicons.org/?q=zenn */}
      <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="h-4 w-4"
      >
        <path d="M.264 23.771h4.984c.264 0 .498-.147.645-.352L19.614.874c.176-.293-.029-.645-.381-.645h-4.72c-.235 0-.44.117-.557.323L.03 23.361c-.088.176.029.41.234.41zM17.445 23.419l6.479-10.408c.205-.323-.029-.733-.41-.733h-4.691c-.176 0-.352.088-.44.235l-6.655 10.643c-.176.264.029.616.352.616h4.779c.234-.001.468-.118.586-.353z" />
      </svg>
      <span className="text-sm">Zenn</span>
    </div>
  );
};

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
        className="inline-block w-full text-lg font-medium text-skin-accent decoration-dashed underline-offset-4 focus-visible:no-underline focus-visible:underline-offset-0"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="flex flex-row items-start justify-between sm:justify-normal">
          <h2 {...headerProps}>{title}</h2>
          {/* https://icones.js.org/collection/carbon?s=arrow&icon=carbon:arrow-up-right */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 32 32"
            className="h-4 w-4 flex-none opacity-50"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M10 6v2h12.59L6 24.59L7.41 26L24 9.41V22h2V6z"
            />
          </svg>
        </div>
      </a>
      <div className="flex w-full flex-row items-center space-x-2">
        <Collection collection={collection} />
        <Datetime pubDatetime={pubDatetime} />
      </div>
    </li>
  );
}
