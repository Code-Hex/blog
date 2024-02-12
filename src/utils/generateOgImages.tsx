import satori, { type SatoriOptions } from "satori";
import { Resvg } from "@resvg/resvg-js";
import postOgImage from "./og-templates/post";
import { type CollectionEntry } from "astro:content";

// const fetchFonts = async () => {
//   // Regular Font
//   const fontFileRegular = await fetch(
//     "https://www.1001fonts.com/download/font/ibm-plex-mono.regular.ttf"
//   );
//   const fontRegular: ArrayBuffer = await fontFileRegular.arrayBuffer();

//   // Bold Font
//   const fontFileBold = await fetch(
//     "https://www.1001fonts.com/download/font/ibm-plex-mono.bold.ttf"
//   );
//   const fontBold: ArrayBuffer = await fontFileBold.arrayBuffer();

//   return { fontRegular, fontBold };
// };

const notoSans = await loadGoogleFont({
  family: "Noto Sans JP",
  weight: 500,
});

const options: SatoriOptions = {
  width: 1200,
  height: 630,
  // debug: true,
  embedFont: true,
  fonts: [
    {
      name: "NotoSansJP",
      data: notoSans,
      weight: 500,
      style: "normal",
    },
  ],
};

export async function loadGoogleFont({
  family,
  weight,
  text,
}: {
  family: string;
  weight?: number;
  text?: string;
}) {
  const params: Record<string, string> = {
    family: `${encodeURIComponent(family)}${weight ? `:wght@${weight}` : ""}`,
  };

  if (text) {
    params.text = text;
  } else {
    params.subset = "latin";
  }

  const url = `https://fonts.googleapis.com/css2?${Object.keys(params)
    .map(key => `${key}=${params[key]}`)
    .join("&")}`;

  const res = await fetch(`${url}`, {
    headers: {
      // construct user agent to get TTF font
      "User-Agent":
        "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
    },
  });

  const body = await res.text();
  // Get the font URL from the CSS text
  const fontUrl = body.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/
  )?.[1];

  if (!fontUrl) {
    throw new Error("Could not find font URL");
  }

  return fetch(fontUrl).then(res => res.arrayBuffer());
}

function svgBufferToPngBuffer(svg: string) {
  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  return pngData.asPng();
}

export async function generateOgImageForPost(post: CollectionEntry<"blog">) {
  const svg = await satori(postOgImage(post), options);
  return svgBufferToPngBuffer(svg);
}
