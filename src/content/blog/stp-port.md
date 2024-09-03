---
title: STP のルートポート、指定ポートの選出
pubDatetime: 2024-09-03T21:48:20.000+09:00
featured: false
draft: false
tags:
  - network
description: STP の基本的なプロセスであるルートポート、および指定ポートの選出についてのメモ
---

STP とは [Spanning Tree Protocol](https://en.wikipedia.org/wiki/Spanning_Tree_Protocol) のこと。

基本的なポート選出についてメモ。

1. ルートブリッジを選出する必要がある
2. ルートポートを選出する必要がある
3. 指定ポートを選出する必要がある

これらが達成できると残りのポートがブロッキング（非指定）ポートとなる。

**ルートポートの選出**

ルートポートは、非ルートブリッジである各スイッチで必ず1つ選出される。

**指定ポートの選出**

各リンクごとに1つの指定ポートが選出される。