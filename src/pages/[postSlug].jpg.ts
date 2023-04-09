import { getCollection } from "astro:content";
import generateOgImage from "@utils/generateOgImage";
import type { APIRoute } from "astro";

//@ts-ignore reason: APIRoute の EndpointOutput の body が string しか受け付けない
// しかしドキュメントでは許容されている
// https://docs.astro.build/en/core-concepts/endpoints/
export const get: APIRoute = async ({ params, props }) => {
  const buffer = await generateOgImage(
    props.title,
    params.postSlug,
    props.datetime
  );
  return {
    body: Buffer.from(buffer),
    encoding: "binary",
  };
};

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
