export const SITE = {
  website: "https://blog.codehex.dev/",
  author: "codehex",
  profile: "https://codehex.dev/",
  desc: "プログラミングやガジェッド、思ったことを雑に書いていくブログです。",
  title: "アルパカ三銃士",
  ogImage: "main-ogp.png",
  lightAndDarkMode: false,
  postPerIndex: 4,
  postPerPage: 7,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: false,
  showBackButton: true, // show back button in post detail
  editPost: {
    url: "https://github.com/Code-Hex/blog/edit/main/src/content/blog",
    text: "Suggest Changes",
    appendFilePath: true,
  },
} as const;
