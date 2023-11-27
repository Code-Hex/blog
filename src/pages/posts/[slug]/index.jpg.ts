import { getCollection, type CollectionEntry } from "astro:content";
import { generateOgImageForPost } from "@utils/generateOgImages";
import type { APIRoute } from "astro";
import { slugifyStr } from "@utils/slugify";

export const GET: APIRoute = async ({ props }) => {
  const buffer = await generateOgImageForPost(props as CollectionEntry<"blog">);
  return new Response(buffer, {
    headers: { "Content-Type": "image/jpeg" },
  });
};

export async function getStaticPaths() {
  const posts = await getCollection("blog").then(p =>
    p.filter(({ data }) => !data.draft && !data.ogImage)
  );

  return posts.map(post => ({
    params: { slug: slugifyStr(post.data.title) },
    props: post,
  }));
}
