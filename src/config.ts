import type { SocialObjects } from "./types";

export const SITE = {
  website: "https://blog.codehex.dev/",
  author: "codehex",
  desc: "A minimal, responsive and SEO-friendly Astro blog theme.",
  title: "アルパカ三銃士",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: false,
  postPerPage: 3,
};

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
