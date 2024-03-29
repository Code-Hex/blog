---
title: RACI を使った責務の明確化
pubDatetime: 2019-08-06T00:11:20
slug: raci_matrix
featured: false
draft: false
tags:
  - RACI
description: 役割分担を matrix を使って明確描写するビジネスツール RACI についてメモ。
---

今日会社ではじめて「RACI」という言葉を知った。

会社では呼び名が分からなかったのでずっと「[ラッシー](https://ja.wikipedia.org/wiki/%E3%83%A9%E3%83%83%E3%82%B7%E3%83%BC)」と呼んでいたが、本当は「レイシー」と呼ぶらしい。RACI matrix と呼ぶっぽい。

これはプロジェクトや社内での何かしらの工程での役割分担を matrix を使って明確描写するビジネスツールとのこと。

タスクを 4 種類の参加者の責任型に分割し、各参加者には異なる役割が割り当てられる。そしてそれぞれの役割は下記のように決まっている。

{/_ more _/}

- R = Responsible (also Recommender)
  - タスク達成のために働く責任者。複数のリソースについて責任を持つことがある。
- A = Accountable (also Approver or final approving authority)
  - タスクの前提条件が満たされることを明らかにする
  - 実行責任を負うもの（Recommender）に作業を委任する
  - 最終的に実行責任者が完了したタスクや成果物に対して承認しなければならない
  - 各タスクの窓口は 1 つでなければならない
- C = Consulted (sometimes Consultant or counsel)
  - 相談先
  - 双方向コミュニケーション
- I = Informed (also Informer)
  - 常に進捗を把握してる
  - 一方向のコミュニケーション

これらの **R/A/C/I** を matrix の各マスに当てはめててく。こんな感じ

![RACIQ Chart - Responsibility Assignment Matrix.jpg](https://upload.wikimedia.org/wikipedia/commons/1/13/RACIQ_Chart_-_Responsibility_Assignment_Matrix.jpg)

## どう割り当てるべきか

- Responsible と Accountable は同一の人間に割り当てられることが多い（らしい）
- 各タスクについて、一般に各参加者がそれぞれ 1 つの役割を割り当てられるのが推奨されている
- 1 人に複数の責任型を割り当てることもあるが、**役割が計画時点で決められないことを暗に示しており、各タスクにおける役割分担を明確化するというこの手法の価値を減じることになる**

## 実際に割り当ててみる

これはほんの一部だけど実際に割り当てた様子がこんな感じ。

| Development |                    | Director | EM  | TL  | Member | memo                             |
| :---------: | :----------------: | :------: | :-: | :-: | :----: | -------------------------------- |
|             |     Design Doc     |          |     |  A  |   R    | Write design doc                 |
|             | Technical Decision |          |     |  A  |   R    | Decide technical something       |
|    Team     |                    |          |     |     |        |                                  |
|             |    Team Roadmap    |    I     |  A  |  R  |   C    | Decide our roadmap               |
|             |  Setting Team OKR  |    I     |  A  |  R  |   C    |                                  |
|  Incident   |                    |          |     |     |        |                                  |
|             | Incident Response  |    I     |  I  | R/A |  R/A   | Response when an incident occurs |

実際に割り当ててみると、一人の人物が実行責任と説明責任を持たなければならないケースが多々あった。今振り返ってこれを書いてるけど

> Responsible と Accountable は同一の人間に割り当てられることが多い

これが当たってて凄いなあと思った。しかし R/A が２つの参加者にどうしても割り当てられるケースもあって難しいなと思った。

割り当てる時チーム内でも R/A/C/I のそれぞれが誰に割り当てられるべきか結構議論もできたので、チーム内での認識合わせには丁度良いコミュニケーションツールになるだろうなと思った。

## 参考

- [Responsibility assignment matrix](https://en.wikipedia.org/wiki/Responsibility_assignment_matrix)
