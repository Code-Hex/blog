import type { CollectionEntry, CollectionKey } from "astro:content";
import postFilter from "./postFilter";

const getSortedPosts = <C extends CollectionKey>(
  posts: CollectionEntry<C>[]
) => {
  return posts
    .filter(v => {
      if (v.collection === "blog") {
        return postFilter(v);
      }
      return true;
    })
    .sort(
      (a, b) =>
        Math.floor(
          new Date(b.data.modDatetime ?? b.data.pubDatetime).getTime() / 1000
        ) -
        Math.floor(
          new Date(a.data.modDatetime ?? a.data.pubDatetime).getTime() / 1000
        )
    );
};

export default getSortedPosts;
