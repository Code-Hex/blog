---
pubDatetime: 2023-04-14T14:00:00+09:00
title: ChatGPT を Slack で動かすのが楽しい
slug: notahotel_ideathon_2023
featured: true
draft: false
tags:
  - notahotel
  - chatgpt
  - slack
description: NOT A HOTEL 社内イベントとしてアイディアソンを開催し、その運営をしながら CTO の @okbtks と ChatGPT Slack ボットを開発した楽しい話
---

僕は [NOT A HOTEL](https://notahotel.com/) という会社で働いている。

先日社内イベントとしてアイディアソンを行った。ここで僕と [CTO の @okbtks](https://twitter.com/okbtks) と[@mamiracle\_\_](https://twitter.com/mamiracle__) は運営をやっていて、その片手間で @okbtks と一緒にハッカソンをしていた。

そこで作ったのがこの「kevin」ボット。

https://twitter.com/codehex/status/1646153942735241217

まず 2 人ハッカソンのテーマとして Slack に GPT-4 の AI アシスタントを導入できるように作ってみようなった。会社には既に [ChatGPT Playground](https://twitter.com/okbtks/status/1642698758495543296) も存在していたが Slack へ導入した理由はいくつかある。

1. ChatGPT を使うためのハードルを下げたい
2. [ShareGPT](https://sharegpt.com/) のように ChatGPT でどうやりとりしているのかを共有したい
3. 個人情報保護の観点で内製の ChatGPT を使ってもらいインシデントを防ぐ[^1]
4. スレッドの今北産業（要約機能）が熱望されていた

[^1]: API を通じて送信されたデータは、不正使用や悪用の監視のために最大 30 日間保持され、その後削除される。あまり知られてないが [SOC 2 Type 2](https://us.aicpa.org/interestareas/frc/assuranceadvisoryservices/serviceorganization-smanagement.html) に準拠している。[API data usage policies](https://openai.com/policies/api-data-usage-policies)

前提として NOT A HOTEL では[様々な業種](https://open.talentio.com/r/1/c/notahotel/homes/3867)の方々が働いている。
例えば建築だったり、セールス、子会社の [NOT A HOTEL MANAGEMENT](https://notahotel.com/management) を含めると NOT A HOTEL の運営スタッフや CS などなど。全員ではないが話題になっているとはいえ、新しく出てきたオンラインツールを触ることに抵抗がある方々はやっぱり多い。

そこで ChatGPT Playground は 1. と 3. の観点で作られた。
特に 1. に関して ChatGPT Playground は OpenAI のサイトでアカウントを作って ChatGPT を使い始める所にハードルを感じているのだろうといった仮説を持って開発し、公開したが全く社内での利用が広がらなかった。

これは後々ヒアリングをして分かったことだったが、テキストの入力フォームだけあっても何を入力すればいいのかが分からないといった点でハードルを感じていたらしい。

![ChatGPT Playground テキストの入力フォーム。Placeholder には「入力して、何か聞いてみてください」と表示されている。](https://user-images.githubusercontent.com/6500104/231925835-962941f8-a5db-45e7-b63e-f77e5f4cf5a4.png)

同じチームの人が使っている様子を共有できればどうやって使えるのかが分かるのではないかと考え 2. の仮説も検証することにした。どの業種でも入社すると必須になるツールは Slack だったため Slack へ ChatGPT の機能を導入してみようとなった。

## kevin の仕様を考える

最初にどんな機能を持たせるかを 2 人でアイディアを出し合った。まず ChatGPT 特性と Slack でどの機能を使っているかを考えた。

- ChatGPT の特性
  - 会話の履歴から学習できる（In-context Learning）
- Slack でどの機能を使っているか
  - メンションをつけて誰かを呼び出す
  - 議論はスレッドで行う

これらを元に作成した kevin ボットは次の機能を持たせることにした。

- ChatGPT をメンション付きで呼び出して会話を始められる
- Slack スレッドを文脈として認識できるようにする
  - kevin からのリプライはスレッドに展開される

## 2 人ハッカソン

ハッカソンは 15:00 からアイディアソンの成果発表会があったため時間としては 10:30 ~ 15:00 くらいで行った。

2 人と見せかけて実はもう一人いる。本家 ChatGPT だ。

ChatGPT には [Cloud Functions for Firebase](https://firebase.google.com/docs/functions) 上で動き、Slack 上で上記で挙げた振る舞いができるコードを TypeScript で作成してもらった。これは @okbtks が ChatGPT へ注文していた。

|                                                                                                                      |                                                                                                                      |                                                                                                                      |                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| ![image](https://user-images.githubusercontent.com/6500104/231930219-d53ec473-0a27-4afb-b904-073074749f6f.png =200x) | ![image](https://user-images.githubusercontent.com/6500104/231930248-2bf188fd-dcc9-458f-8b16-a8459dc39275.png =200x) | ![image](https://user-images.githubusercontent.com/6500104/231930291-2826457e-aadf-437d-889d-219f68fcc973.png =200x) | ![image](https://user-images.githubusercontent.com/6500104/231930330-a8382795-0435-4ee4-baa6-4ae9cc188ed0.png =200x) |

僕がやったこと。

1. 作ってもらった Slack ボットのコードをデプロイする
2. 動くように修正する
3. [Chat Completion API](https://platform.openai.com/docs/api-reference/chat) を組み合わせる
4. インスタンス数を変更する
5. Markdown のコードを Slack の書式へ変換する
6. デプロイする

最後に @okbtks がリトライ関係で重複したイベントを排除するロジックを導入してくれた。

最終的なコミットログはこんな感じ。このコミットログに僕は isucon っぽさを感じた。また isucon 参加したい...

![コミットログ。Initial commit から始まって最後は @okbtks のコミットで終わる。](https://user-images.githubusercontent.com/6500104/231933529-15a54c9e-b047-45db-b718-35d92f825608.png =300x)

この時 CTO の分報チャンネルはこんな感じでデバッグ会場になっていた。他の人はアイディアソンへ夢中になっているので誰も気づくことはなかった。

![デバッグチャンネル化している CTO の分報チャンネル](https://user-images.githubusercontent.com/6500104/231932634-7815aa75-d42c-4630-85dc-f53d47573448.png =300x)

最後の 42 件スレッドが溜まっているところで成功を確認した。楽しい！

## イベントが終わってから

アイディアソンのイベントが終わってから、時間が空いたタイミングで僕がこの kevin ボットをメンテしている。

急いで作ったボットで扱っていたトークンなどのシークレット情報をちゃんと保存するようにしたり、エラーメッセージ + 受け取った時のネクストアクションをわかりやすくするといった修正をした。

@okbtks が後に全員を招待した #all-kevin というチャンネルを作成し、各職種ごと一番注目されるチャンネルに kevin ボットを招待してやり取りを行ってみせた。このおかげで Slack を眺めてる感じだと活発的に ChatGPT が使われるようになったと感じる。

![image](https://user-images.githubusercontent.com/6500104/231935096-f5d18135-0e87-46aa-93f9-5b1b26467308.png =300x)
_要約をさせてる様子_

![image](https://user-images.githubusercontent.com/6500104/231983889-5e49c28c-848d-4acf-a52c-87e0dba3cc83.png =300x)
_韻を踏ませる CTO_

ちゃんとメンションをつけてくれたり、想定もしていなかった返しをしてくれるので可愛い。

## 今後の開発

[GPT-3.5 を使った AI コンシェルジュの開発秘話を YAPC::Kyoto 2023 Reject Con で話してきました / YAPC::Kyoto 2023 の感想](https://codehex.hateblo.jp/entry/2023/03/20/090000)でも話したが、僕も会社では本家 kevin の開発を含めてチャット機能の改修だったり表には出ていないが、もう一個プロジェクトを抱えていて割と厳しくなってきているのでもっと仲間を増やしたい。誰か...（切実）

とはいえハッカソンから 1 週間以上経ち、片手間ではあるが継続的に小さい改修を続けられている。理由はシンプルに楽しいからだろうと思っている。やれることも多いからかどんどんアイディアが湧いてくる。

とりあえず直近はファイルの読み取りだったり、トークン上限を気にせずに In-context Learning を行えるようにするなど改善をしていきたいと思っている。

NOT A HOTEL は AI を全社で使っていこうとしているので開発もとてもやりやすい。

興味を持った方、直近でイベントを開催するので是非気軽に参加してみてください！

https://notahoteltalk6.peatix.com
