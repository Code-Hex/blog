import { getCollection } from "astro:content";
import generateOgImage from "@utils/generateOgImage";
import type { APIRoute } from "astro";

export const get: APIRoute = async ({ params, props }) => ({
  body: await generateOgImage(props.title, params.postSlug, props.datetime),
});

const postImportResult = await getCollection("blog", ({ data }) => !data.draft);
const posts = Object.values(postImportResult);

export function getStaticPaths() {
  return posts
    .filter(({ data }) => !data.ogImage)
    .map(({ data }) => ({
      params: { postSlug: data.postSlug },
      props: { title: data.title, datetime: data.pubDatetime },
    }));
}
