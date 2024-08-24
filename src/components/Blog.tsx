import type { FC } from "react";
import "zenn-content-css";

export const Blog: FC<{ html: string }> = ({ html }) => {
  return (
    <article
      id="article"
      role="article"
      className="mx-auto mt-2 max-w-3xl px-4"
    >
      <div
        className="znc"
        dangerouslySetInnerHTML={{
          __html: html,
        }}
      />
    </article>
  );
};
