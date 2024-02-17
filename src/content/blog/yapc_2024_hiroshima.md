---
author: codehex
pubDatetime: 2024-02-15T00:27:01.000Z
modDatetime:
title: YAPC::Hiroshima 2024 に参加しました
featured: false
draft: false
tags:
  - yapc
  - perl
  - cloudflare
description: YAPC::Hiroshima 2024 へ登壇者として参加しました。Hono Meetup への参加、Cloudflare Workers に関するトーク、YAYAPC への参加を通して沢山の方々と充実のある交流をしました。
---

[YAPC::Hiroshima 2024](https://yapcjapan.org/2024hiroshima/) に参加しました。
参加と同時に、現在所属している会社の NOT A HOTEL もシルバースポンサーになってくれました。これはとても良いこと。

## 沖縄からの参加

沖縄から広島までの飛行機は行き帰りとも1便ずつしかなく、1ヶ月前でもチケットが取れなかったので今回は沖縄 → 福岡 → 広島の経路で行きました。福岡広島間は新幹線での移動でした。

## Hono Meetup #02

[Hono Meetup #02](https://connpass.com/event/303918/)へ参加するために会場近くの商店街をうろうろしていると [@chimame_rt](https://twitter.com/chimame_rt) さんがお店の前で待っていたので先に一緒に入って色々話してました。

この時に教えてもらったのが `performance.now()` が何かしらの I/O が発生しない限り更新されないということでした。ログを見てみると確かにいくつか 0 になっていたことが発覚しました。

```ts
const start = performance.now();
for (let i = 0; i < 1e6; i++) {
  // do expensive work
}
const end = performance.now();
const timing = end - start; // 0
```

https://developers.cloudflare.com/workers/runtime-apis/performance/

どうしようか検討中です。

## YAPC::Hiroshima 2024

### Cloudflare Workers のトーク

「Go to Cloudflare Workers ~ 移行から 0.5 年以上運用する」というタイトルで Cloudflare Workers へ移行してから半年以上運用してきて、大変な面をメインで話しました。

@[speakerdeck](66d383772c1843d1851fba5ca319d25e)

アプリケーションの運用で欠かせないログとトレース、監視のために必要なメトリクスの取得を考えると難しくなるよ！といった話でした。しかし誤解しないで欲しいのは Cloudflare Workers をオススメしないという話ではない点です。Cloudflare Workers 自体は、オリジンへリクエストを送る前や、オリジンからのレスポンスを加工して何かアクションする、クライアントのために簡単なエンドポイントを作成するといった、ちょっとした用途にはオススメできそうです。[^1]

デプロイはマジで早いので是非使って欲しいです！

[^1]: D1 や Workers Queue など便利なミドルウェアが沢山出てきてますが、現時点ではいずれもベータのため、アプリケーションとして利用する場合は、何かあったときに対処できる技術力は必要そうです。

### rakulangで実装する! RubyVM

大学の後輩の [@AnaTofuZ](https://twitter.com/AnaTofuZ) 発表。Ruby VM を [Raku](https://raku.org/) (旧 Perl6) を使って実装していく話でした。`InstructionSequence` クラスを利用すると人間が読める状態で出力してくれるので、それに合わせて処理を記述していったそうです。

なぜ、バイトコードではなく pretty print されたものを利用して実装しているかの説明として、最初からバイトコードを想定したコードを書くのではなく、やりやすい部分から手をつけていけると自分のモチベーション維持に繋がって開発が続けられるからとのことでした。これには凄く納得があって、自分の今後の開発スタイルにも影響しそうでした。

### キーノート

[とほほのWWW入門](https://www.tohoho-web.com/)のとほほさんによるセッション。さまざまな入門の記事は全て趣味としてやっているので、ここまで継続できたと話をされていました。

とても羨ましい趣味...

知らなかった入門がいっぱいあったので、ゆっくりできるタイミングで覗こうと思います。

### 交流

スポンサーブースでは[タイミー](https://timee.co.jp/)さんのブースに参加して、見事に限定ストレッチボールを引き当てました！これは嬉しかったです。

![](https://storage.googleapis.com/zenn-user-upload/d2b351e559d1-20240215.jpeg)

メルカリ時代の同期の [@upamune](https://twitter.com/upamune) だったり、入社した時の CTO だった [@sotarok](https://twitter.com/sotarok) さん、元チームメイトの [@nozo_moto](https://twitter.com/nozo_moto) さんといった久しぶりに話せた人が多くて楽しかったです。

懇親会でも Cloudflare Workers についてだったり、[Okinawa.pm](https://okinawa.pm.org/) として各地の Perl コミュニティで交流した時に出会った方々とも久しぶりに話せたのが本当に嬉しかったです。

Perl コミュニティは一番好きなコミュニティです！

## YAYAPC

[YAYAPC::Hiroshima ～オフラインだからできる話〜](https://connpass.com/event/300500/) にも参加しました。ここでもトークをしましたが内緒で。このトークに関して、質問をしてくださる方が結構多かったので楽しく聞いてくれたのかなと感じました。

このイベントに参加して、ずっとお話を聞きたかった「VISAカードの裏側と “手が掛かる” 決済システムの育て方」で登壇されてベストスピーカー賞を取った @shohei1913 さんと一緒にランチへ行けました！これは広島に行って一番嬉しいことでした。NOT A HOTEL から一緒に YAPC へ参加していた同僚の @imashin\_ も一緒で、お二人ともクレジットカード事情に詳しくてかなり勉強になりました。この場だけで一つのイベントが開催できちゃうんじゃないかと思いました。

@[tweet](https://x.com/shohei1913/status/1756540418609786956?s=20)

場所は広島駅にある「[廣島つけ麺本舗 ばくだん屋 ekie店](https://tabelog.com/hiroshima/A3401/A340121/34027266/)」だったと思います。@shohei1913 さんが教えてくださったお店で、沖縄では堪能できない形のつけ麺で大満足でした。

## ありがとう運営の皆さん

僕自身沖縄からリモートワークとして働いていることもあり、東京で仲良くなったエンジニアの皆さんと交流できる機会が少なくなっているため、YAPC が一つのきっかけになるのは嬉しいと感じています。

参加者は 400 人以上だったそうで、運営スタッフの皆様も準備が大変だったんだろうなと想像しています。それでも、参加して良かったと思わせてくれるカンファレンスにしてくださったことに本当に感謝でいっぱいです。

ありがとうございました。
