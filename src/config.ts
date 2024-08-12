import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://blog.codehex.dev/",
  author: "codehex",
  profile: "https://codehex.dev/",
  desc: "プログラミングやガジェッド、思ったことを雑に書いていくブログです。",
  title: "アルパカ三銃士",
  ogImage: "main-ogp.png",
  lightAndDarkMode: false,
  postPerIndex: 4,
  postPerPage: 3,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
};

export const LOCALE = {
  lang: "ja", // html lang code. Set this empty and default will be "ja"
  langTag: ["ja-JP", "en-EN"], // set to [] to use the environment default
} as const;

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/Code-Hex",
    linkTitle: ` ${SITE.author} on Github`,
    active: true,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/codehex",
    linkTitle: `${SITE.author} on Twitter`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/codehex/",
    linkTitle: `${SITE.author} on LinkedIn`,
    active: true,
  },
];
