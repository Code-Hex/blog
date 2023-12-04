---
pubDatetime: 2023-12-04T09:12:33+09:00
title: Go Conference mini 2023 Winter IN KYOTO に参加しました
postSlug: go_conf_2023_mini_kyoto
featured: true
draft: false
tags:
  - Go
  - Golang
description: 2023/12/02 に京都の QUESTION で開催された Go Conference mini 2023 Winter IN KYOTO へ沖縄から参加しました。そこでの感想を書きました。
---

2023/12/02 に京都の [QUESTION](https://goo.gl/maps/3t2BFHrQMaLEtyHU7) で開催された Go Conference mini 2023 Winter IN KYOTO へ沖縄から参加しました。

## 前日入り

開催は 12/02 だったのですが、今回は沖縄から参加するということもあり 12/01 に京都へ入りました。ルートはこんな感じになりました。

1. 那覇空港 → 伊丹空港
2. 伊丹空港 → リムジンバスで京都駅

伊丹空港発で京都駅へ向かうバスは 2 番乗り場でした。実は [YAPC::Kyoto 2023](https://yapcjapan.org/2023kyoto/) で沖縄から京都へ行ったことがあるのですが、このバスの乗り場で、どこに並べばいいのか分からなくて困ったことがありました。その反省を活かして移動することができたので、想定していた時間よりも早く着くことができました。

![](https://storage.googleapis.com/zenn-user-upload/187a0895adf1-20231202.png)

https://www.okkbus.co.jp/busstop/itm/

今回宿泊したホテルは「[HOTEL GRAN Ms KYOTO](https://maps.app.goo.gl/uAZpdD2kAXq925jT9)」でした。ホテル自体はかなり綺麗で、海外からの宿泊者も多く、観光産業としてはコロナから回復しつつあるんだなと感じることができました。

NOT A HOTEL で一緒に働いている [@fumifumi\_\_8](https://twitter.com/fumifumi__8) と [@uji_rb](https://twitter.com/uji_rb) の2人と合流して「[.andwork kyoto (アンドワーク京都)](https://maps.app.goo.gl/ZXf2ASN3e5Nyfnph6)」で資料作りだったり、通常通りの開発作業をしました。そのあとみんなでラーメンを食べに行きました。

鰻屋さんが1Fにあってラーメン屋さんはその上にあったので、うなぎに惹かれつつも入ったラーメン屋さんのラーメンは美味かったです！

## カンファレンス当日

資料は 01:30 くらいに作成が完了しました。朝は 09:40 くらいに会場に着いてスタンバイしました。

11:45 ~ 「日時処理の新スタンダード: Synchro によるタイムゾーン安全、楽々開発」というタイトルで [github.com/Code-Hex/synchro](https://github.com/Code-Hex/synchro) という開発中の日付、時間処理を行うライブラリの話をさせていただきました。緊張しましたが、時間ぴったり話せて安心しました。

@[speakerdeck](80a3c77ea9c147ec85a8985788e08e8a)

個人的には週一で NOT A HOTEL の社内 Go 勉強会を開催していることもあって、[@stefafafan](https://twitter.com/stefafafan) さんの「開発チーム横断タスクフォース「Goサブ会」の運用事例と今後の展望」に凄く興味を惹かれました。他社の Go の布教活動だったり、コードをどう書くといいよ！みたいな活動の話を聞けてためになりました。

会場の後ろにはホワイトボードが二つあって、一つはどこから参加したか書こう！というのと、ジョブボードの役割を持つものでした。それぞれこんな感じで書いてます。

![](https://storage.googleapis.com/zenn-user-upload/2e37dd0ad2bd-20231202.png)
_沖縄から来たぞ！！_

![](https://storage.googleapis.com/zenn-user-upload/2c963681cc3f-20231202.png)
_ジョブボード_

### 懇親会

懇親会場へ向かうかーとしていた時に @fumifumi\_\_8 が [@bartke](https://github.com/bartke) さんと交流していました。彼は日本語が話せない方でしたが、それでも今回の Go Conference から色んなものを学びたいと参加されていました。

イベントが終わったのは 17:30 くらいで、@fumifumi\_\_8 とは解散し、彼と2人で懇親会場へ向かいました。17:45 くらいについてしまったので先に2人で新しく予約を取って飲みながら交流していました。

自分も久しぶりに拙い英語を駆使しながら、交流を頑張ってみました。

- 東京から香港の会社でリモートワークしていること
- ブロックチェーンを駆使していること
- OpenTelemetry を使っていて、トレース情報は全て prometheus へ送っていること

トピックとしては大体こんな感じだったと思います。そして HTMX という最高の技術があって...となったタイミングでかなり意気投合しました。

https://github.com/angelofallars/htmx-go

そして本懇親会がスタートし、久しぶりに [@songmu](https://twitter.com/songmu) さんだったり [@tenntenn](https://twitter.com/tenntenn) さんと交流できて嬉しかったです。

一番驚いたトピックは今の学生や若者が [@deeeet](https://twitter.com/deeeet) さんを知らないということでした。

とにかく、オフラインだからこそ話せるようなことを沢山できたので本当に参加した甲斐がありました。

## 感想

京都は12月ということもあってかなり寒いだろうと警戒して行きました。思ってた以上に寒くはなく、少し紅葉も見ることができて京都自体も最高でした。

また Go 界隈で何人か知っている方々ともお話しできたこともオフライン参加の醍醐味だったなーと感じました。とても楽しかったです。

Go Conference mini 2023 Winter IN KYOTO のスタッフの皆さんありがとうございました。@tenntenn さんも北海道から配信用の機材を持ち込んで運用していたので凄みを感じました。

また機会があれば参加したいと思います。運営の皆さんありがとうございました。
