---
pubDatetime: 2023-12-16T06:45:06+09:00
title: Workers Tech Talks 2 へ参加しました
postSlug: workers_tech_2
featured: true
draft: false
tags:
  - cloudflare
description: Workers Tech Talks 2 へ参加して AI Gateway について LT もしました。
---

[Workers Tech Talks #2](https://workers-tech.connpass.com/event/300546/) へ参加しました。

[@yusukebe](https://twitter.com/yusukebe) さんのマネージャーである [@rickyrobinett](https://twitter.com/rickyrobinett) さんが Workers AI のデモをしてくださるとのことで、参加せずにはいられませんでした。

## 沖縄から東京へ

12:20 発で 15:00 に東京へ着きました。旅行シーズンなのか分かりませんが飛行機は満席でした。

前日にスライドは完成していたものの、せっかく ricky が参加してくれるならと英語スライドへ修正していました。

![](https://storage.googleapis.com/zenn-user-upload/d6c533fc61af-20231216.png)

## 動かなくなった WebSocket

会社で絶賛開発中の機能を Durable Object と Hibernate API を組み合わせて作成していました。この機能は先週には完成していて、開発環境へデプロイしていたのですが、モバイルアプリの開発チームから Internal Server Error が返ってくると報告がありました。

機内、モノレール、ホテルへチェックインしてからも調査をしていましたが、突然動かなくなった原因が全くわかりませんでした。

確認したこと:

- WebSocket は疎通するか -> OK
- API エンドポイントは機能するか -> NG
- API エンドポイントのハンドラで成功レスポンスを返せているか -> OK

この通り、正常ステータスとしてレスポンスを返すことまでは確認できたのですが、なぜ Internal Server Error が発生しているのか不思議でした。

結局、原因が判明したのは会場で皆さんの話を聞いていた時でした。[Hono Server-Timing Middleware](https://hono.dev/middleware/builtin/timing) を計測目的で導入していたのですが、immutable なレスポンスオブジェクトをハンドラから返していた場合に発生することが原因でした。

この一連の作業のせいで、私の LT の時にはバッテリー残量が 7% になっていたのでした。

## LT

LT は AI Gateway について話しました。無事全て話すことはできましたが、会場の皆さんにとっては 7% の状態でスライドを表示しながらどこまで話せるんだろうかといったチキンレース状態だったそうです。

内容は AI Gateway について簡単な説明と、Real-time logs の機能でバグが発生していた際に迅速に対応してもらった pedro さんの話をしました。

@[speakerdeck](57b43fab37964c09b81d8b11d4d52d78)

また、イベントの最後では遠くから参加してくれた賞として Cloudflare のキャップをいただきました。ありがとうございました！
常にキャップを被っている身として、今年もらった技術系ノベルティの中で一番嬉しかったプレゼントでした。

@[tweet](https://x.com/codehex/status/1735629754701918473?s=20)

## ricky とのお話

Discord で AI Gateway に関するフィードバックを送っていると話をしました。なんと、そのことを彼は知っていたのです。それが非常に嬉しかったし、AI Gateway の様々な issue に向き合ってくださった michelle や pedro さんに感謝をしている気持ちを伝えたつもりです。

私が会話した AI Gateway の開発メンバーを始め、Cloudflare Workers の主要な機能を開発しているメンバーや、開発裏話についてお話を聞きました。あとは私が会社でやっている ChatGPT の API を使ったチャットボットの開発の話もしたり、沖縄って最高なんですよ！といったお誘いもしておきました。

リスニングが苦手な私に対しても、聞き取りやすくゆっくり、簡単な言葉を選んでくださったのでとてもお話ししやすかったです。

![](https://blog-assets.codehex.dev/IMG_1157.jpg)

開発関連以外でも、本当に楽しくお話しできたのでとても楽しかった...
またお会いできることを願ってます！

## 懇親会

懇親会では多くのトピックがありました。

- YouTube や Twitch の Live 配信
- ChatGPT が遅いこと
- Cloudflare Workers の使い所
- npm や CPAN について
- Deno

@yusukebe さんと hono について最近出した issue について話をしたり、usualoma さんはアイディアとその実装をやりとけげてしまうので本当に凄いなど会話をしました。@mizchi さんからはライブラリでクラスを提供する際、ユーザーに自由に初期化してもらうような形式ではなく、static メソッドを経由した factory っぽい形で提供すると良いというアドバイスをいただきました。これは確かに納得でとても勉強になりました。

## 次回も参加したい！

沖縄から東京への参加は本当に大変です。飛行機だけでなく、羽田空港からまた電車を使った移動が発生するため +1h はかかってしまいますが、日本で Cloudflare Workers を本番に投入してる方の数がまだ少ないこともあるため、知見を共有できる場としてとても価値があるイベントだと思っています。

また開催されればぜひ参加したいと思っています。運営の @yusukebe さん始め、会場提供してくださった[クラスメソッド](https://classmethod.jp/)[^1]さんも本当にありがとうございました。

[^1]: 実は沖縄にも拠点があるので良い会社です。
