import { SITE } from "@/config";

export const LOCALE = {
  lang: "ja", // html lang code. Set this empty and default will be "ja"
  langTag: ["ja-JP"], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const;

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS = [
  {
    name: "Github",
    href: "https://github.com/Code-Hex",
    linkTitle: ` ${SITE.author} on Github`,
    active: true,
  },
  {
    name: "BlueSky",
    href: "https://bsky.app/profile/codehex.bsky.social",
    linkTitle: `${SITE.author} on BlueSky`,
    active: true,
  },
  {
    name: "X",
    href: "https://x.com/codehex",
    linkTitle: `${SITE.author} on X`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/codehex/",
    linkTitle: `${SITE.author} on LinkedIn`,
    active: true,
  },
  {
    name: "Credly",
    href: "https://www.credly.com/users/codehex",
    linkTitle: `${SITE.author} on Credly`,
    active: true,
  },
] as const;

export const SHARE_LINKS = [
  {
    name: "WhatsApp",
    href: "https://wa.me/?text=",
    linkTitle: `Share this post via WhatsApp`,
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/sharer.php?u=",
    linkTitle: `Share this post on Facebook`,
  },
  {
    name: "X",
    href: "https://x.com/intent/post?url=",
    linkTitle: `Share this post on X`,
  },
  {
    name: "Telegram",
    href: "https://t.me/share/url?url=",
    linkTitle: `Share this post via Telegram`,
  },
  {
    name: "Pinterest",
    href: "https://pinterest.com/pin/create/button/?url=",
    linkTitle: `Share this post on Pinterest`,
  },
  {
    name: "Mail",
    href: "mailto:?subject=See%20this%20post&body=",
    linkTitle: `Share this post via email`,
  },
] as const;
