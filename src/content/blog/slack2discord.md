---
title: Slack から Discord へ移行した
pubDatetime: 2022-08-02T13:36:48+09:00
slug: slack2discord
featured: false
draft: false
tags:
  - Slack
  - Discord
  - Go
  - Golang
description: Slack のフリープランだと 90 日分しかメッセージを保存できなくなってしまうので Discord へ移行しました。
---

[Join code-hex workspace on Slack.](https://codehex.dev/slack_invitation/) から入れる。自分の学習した内容だったり、メモ、何かしらのスニペットを雑に投稿するための Slack を運営していた。

Slack へ投稿しておくことで、後で自分が見返したくなった時に検索機能を利用して情報を引っ張ってくるのにとても便利だった。また他人のツイートに関して、その URL を投稿しておくことでオリジナルが削除されても、スナップショットとしても残るので便利だった。

しかし 2022 年 9 月 1 日から Slack のフリープランの内容が改定されることになった。[フリープランの変更に関するよくある質問](https://slack.com/intl/ja-jp/help/articles/7050776459923-%E3%83%97%E3%83%AD%E3%83%97%E3%83%A9%E3%83%B3%E3%81%AE%E6%96%99%E9%87%91%E6%94%B9%E5%AE%9A%E3%81%A8%E3%83%95%E3%83%AA%E3%83%BC%E3%83%97%E3%83%A9%E3%83%B3%E3%81%AE%E6%9C%80%E6%96%B0%E6%83%85%E5%A0%B1#u12501u12522u12540u12503u12521u12531u12395u38306u12377u12427u12424u12367u12354u12427u36074u21839)によると、ワークスペースにある 90 日が経過したメッセージやファイルのデータは全て非表示になり、有料プランへアップグレードしなければアクセスできなくなってしまう。
これでは今まで投稿したコンテンツを見返せなくなってしまうため、[Discord](https://discord.com/) への移行を決めた。

ここではどう移行したかその内容を記録をする。

{/_ more _/}

## Slack のワークスペースの状況

冒頭で紹介した通り、誰でも私の個人 Slack へ参加することは可能だった。しかし幸い(？)なことに私以外の発言はほとんどなかった。

このワークスペースではいくつかチャンネルがあり、私が興味を持ったカテゴリごとに作成していた。それぞれのチャンネルには私の独り言が投稿されている状況だった。

`#status-feed` というチャンネルも存在した。ここでは GCP や GitHub といった自分がよく使うサービスのインシデント情報のフィードを収集していた。

作成したチャンネルへ投稿するだけでなく、自分宛の DM も活用していた。そこではパブリックにできないメモを送信していた。

## Discord へ移行する

移行する要件は次のように決定した。

- 投稿は私だけなので、Discord でも私が投稿したと分かるようにする
  - 私のアカウントとして Slack で投稿していたメッセージを Discord へ投稿すればいい
- Discord へ投稿されるメッセージはシンプルなものにする
  - URL は Discord 側が OGP の情報を使って立地に表示してくれることを期待する
- メッセージがいつのものか把握できるようにする
- チャンネルも同じものを用意する

細かい中身は都度調整するば良いので早速手を動かし始める。

まず最初に行ったのは既存の移行ツールを探すことである。「Slack2Discord」とかで GitHub を検索するといくつかヒットするが、ほとんどが要件を満たせそうにもなかったので諦めた。[^1]

[^1]: 移行完了した後に「[Slack のメッセージをバックアップ](https://www.takameron.info/post/slack_dump/)」という良さそうな記事を見つけた。ここで紹介されている `slack-dump` と呼ばれるツールを使うことも検討できたかもしれない。

そこで簡単なスクリプトを自分で書くことにした。そのコードは私の [Gist](https://gist.github.com/Code-Hex/e1f78e63ebe71ffc1d7b20453c088fab) に投稿した。

### Slack ワークスペースの投稿データを集める

先に Slack 上のメッセージを引いてくるコードを書いた。[conversations.history](https://api.slack.com/methods/conversations.history) と呼ばれる、チャンネル ID を指定するとその ID 内のメッセージを取得できる API を使った。Gist では `history` 関数がその部分である。
ワークスペースに参加しているメンバーでワイワイできるチャンネルはチャンネル ID が `C...` ものになる。冒頭で紹介したように DM も取得したかったため `D...` のようなチャンネル ID も指定できるようにする必要があった。

Slack にはいくつか API Token の種類が存在し、自身の DM を含めたメッセージも取得したいなら [User Token (xoxp-)](https://api.slack.com/authentication/token-types#user) を利用することが必須であった。

Your Apps > OAuth & Permissions > User Token Scopes で必要なスコープを選択して設定を保存をすると User Token を取得できる。

![OAuth Scope では channels:history と im:history を指定する必要がある。](https://user-images.githubusercontent.com/6500104/182142857-36e45207-8284-4c3c-a02d-df15824479bb.png)

どんな内容を取得できるか確認するために全てのメッセージをターミナルへ出力観察した。するとやはり意図しないメッセージが含まれていることに気がついた。

- \*\*\*さんがチャンネルに参加しました
- \*\*\*がこのチャンネルの説明を...
- リンクを含んだメッセージだと特殊なフォーマットとしてリンクが含まれている
  - `<https://badpuns.example.com/puns/123>` だったり `<badpans|https://badpuns.example.com/puns/123>` だったりする

Slack が勝手に投稿するような不要なメッセージは無視するようにコードを書き直した。リンクを含んだメッセージは、稀にリンクテキスト（https://~ で始まるものではなく、テキストにリンクが紐づいてるもの）として表示されるものもあるが、そのテキストは無視してリンクの URL だけをそのまま展開するように修正した。

API は `1648392833.619319` のような投稿された時のタイムスタンプ（`ts`）も返してくれる。これは非常に重要で Discord へ投稿処理を行う前にターミナルへ出力しておくことで途中から再開することが可能になる。[^2]

[^2]: Slack API も [`oldest` パラメータへ指定することでそのメッセージから返してくれるらしい](https://api.slack.com/methods/conversations.history#pagination-by-time)が、なぜか順序が期待しないものになったため、自身のプログラムで処理するようにした。おそらく Slack APi のバグ。

冒頭で紹介した要件を満たすために Gist のコードでは `ts2time` 関数でタイムスタンプを整形してメッセージへ連結するようにしている。

### Discord へ投稿する

これは非常にシンプルで、私自身としてメッセージを投稿するようにすれば良い。

そこでログイン中のアカウントが使用している Authorization Token を取得する必要があり、その方法は「[Discord の自分のアカウントの Token を取得しよう！](https://shunshun94.github.io/shared/sample/discordAccountToken)」を参考にした。

[github.com/bwmarrin/discordgo](https://github.com/bwmarrin/discordgo) というパッケージを利用すると簡単に投稿できた。以下はメッセージを投稿するだけのサンプルである。ここでも Discord のチャンネル ID を指定する必要がある。

```go
apiToken := "..." // 取得してきたもの
discordChannel := "..." // チャンネル ID
session, err := discordgo.New(apiToken)
if err != nil {
	return err
}
_, err = session.ChannelMessageSend(discordChannel, m.Text)
if err != nil {
	return fmt.Errorf("failed to send message: %w", err)
}
```

Discord のチャンネルにカーソルを合わせて「Copy Link」を選択するとこのような URL を取得できる。URL は `://discord.com/channels/.../1003504711648936078` のようになり、この `1003504711648936078` の部分がチャンネル ID になる。

ある程度動いたことを確認したら、Gist のコードのように `history` 関数で取得した Slack のメッセージを Discord へ投稿するように修正した。取得した DM は Discord でプライベートチャンネルを作成し、そこに投稿することにした。

あとはスクリプトを実行して待つだけである。実行指定みた感じ、Discord 側でもメッセージを受け付ける Ratelimit が存在するっぽく、まあまあ時間がかかったので気長に待つつもりで取り掛かった方が良い。

### Discord でフィードを収集する

Slack では標準で RSS のインテグレーションが存在したが、なんと Discord には存在しなかった。そこで調べてみるとどうやら [MonitoRSS](https://github.com/synzen/MonitoRSS) と呼ばれるオープンソースで開発されている bot をインストールすることで解決できた。

[MonitoRSS のページ](https://monitorss.xyz/)から設定できる。

![Control Panel と Invite Me! のボタンが存在するので、それぞれをクリックして設定を行う](https://user-images.githubusercontent.com/6500104/182300585-9fef17ac-d841-4795-9e10-9ef076955819.png)

先に `Invite Me!` をクリックして bot の invite を行う。次に `Control Panel` ボタンをクリックするとフィードの設定を行うことができる。無料プランだと 5 件までフィードを登録することが可能らしい。

フィードも追加して無事に動いてることが確認できたため、移行作業は完了とした。

## 移行後

移行して 2 日目だが良い感じに稼働しているように思える。Discord に慣れていることもあるせいか特に不満はない。強いて言うなら GIF 形式のリアクションを追加するのは有料プラン（[Discord Nitro](https://discord.com/nitro)）へ加入する必要がある点だけだろう。（私個人は別に問題ない）

今回私が行ったことが誰かの参考になることを期待してこの記事を書いた。

:::details メモチャンネルの様子
![](https://user-images.githubusercontent.com/6500104/182301523-b2eaeb63-2930-4a67-afe4-040b27870201.png)
:::

:::details フィードチャンネルの様子
![](https://user-images.githubusercontent.com/6500104/182301538-4edb0e91-c735-41ed-9b55-ecbc63d225cb.png)
:::
