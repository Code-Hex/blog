---
title: オレのおすすめ Git エイリアス 5 選
author: codehex
pubDatetime: 2022-06-06T04:06:31Z
slug: git_alias
featured: false
draft: false
tags:
  - git
description: 普段使っている Git のエイリアスを 5 つ紹介します。
---

[Git のおすすめエイリアス 5 選](https://motemen.hatenablog.com/entry/2022/04/git-aliases)を読んで自分も幾つか晒してみようと思った。

## シンプルなコミットログとグラフを表示する

`git l`

```
l = log --graph --decorate --pretty=oneline --abbrev-commit
```

`git log` を利用するとコミットログからメッセージだったり、誰がコミットしたのか読めるけど殺風景だし、あまりどのブランチがどうマージされたのか理解しずらい。

単純なコミットメッセージとブランチの関係性をパッと知りたい時によく利用している。こんな感じで表示される。

![コミットメッセージとブランチ関係をグラフで表示する](https://user-images.githubusercontent.com/6500104/173620809-771b790a-a4fb-4c38-b4a6-7833a6c39a41.png)

{/_ more _/}

## 人に優しい変更差分を表示する

`git dsf`

```
dsf = "!f() { [ -z \"$GIT_PREFIX\" ] || cd \"$GIT_PREFIX\" && git diff --color \"$@\" | diff-so-fancy  | less --tabs=4 -RFX; }; f"
```

[github.com/so-fancy/diff-so-fancy](https://github.com/so-fancy/diff-so-fancy) を利用して差分を表示している。これは人が読みやすい出力を目指して作られているため、文字単位での変更も分かりやすくしてくれる。

macOS だと homebrew 経由でインストールできる。

```
$ brew update
$ brew install diff-so-fancy
```

GtHub リポジトリの README でも通常の diff とどう違うのかがスクショ付きで紹介されている。下記の画像は改行もハイライトしてくれることを伝えたかったため載せた。

![diff-so-fancy を使った差分表示](https://user-images.githubusercontent.com/6500104/173623988-5422be53-6fe0-4dd8-abd1-516957f04313.png)

## コミットメッセージだけ書く

`git cm`

```
cm = commit -m
```

ガンガンコミットする時は `git cm 'commit msg'` のようにコミットしている。確か `git commit` を使うとエディタが起動されるので面倒だった記憶。

コミット作成の背景など詳細を記述したい場合は `git cm 'title' -m 'description'` のように使う。

## ブランチを切り替える

`git ck`

```
ck = "!f() { [ $# -eq 0 ] && git checkout $(git branch --sort=-authordate | perl -a -nle '$F[0] ne \"*\" and print $F[0]' | fzf --height 40%) || git checkout $@; }; f"
```

本当は `switch` に切り替えたいが未だに checkout を使っている...（ごめんちょ）

基本的な使い方として `git ck -b new_branch` で新しくブランチを作成して `git ck new_branch` をタイプしてブランチを切り替えている。

[github.com/junegunn/fzf](https://github.com/junegunn/fzf) をインストールすることで `git ck` だけタイプすると切り替え可能なブランチ一覧を出力してくれて、選択したブランチへ切り替えられるようにもしている。これは筆者が何ブランチを作っていったっけ？とよくなるからである。

![fzf でチェックアウト可能なブランチをフィルタリングする](https://user-images.githubusercontent.com/6500104/173629121-eb4f5f01-fcf3-4a9a-9954-8426c53a07bf.png)

その前にまず git コマンドの呼び出しを `g` だけで行えるようにしている。

## 直近のコミットから削除したファイルを復元する

`git restore`

```
restore = "!f() { git checkout \"$(git log --format='%h:%ar' -- \"$@\" | head -n 1 | cut -d: -f 1,1)^\" -- \"$@\"; }; f"
```

筆者はおっちょこちょいなため、よく間違ってファイルを消した状態でコミットしてしまうことがある。そこで削除してしまったファイルを過去のコミットから復元させる作業を行うのにこれを使う。

`git restore package.json` すると直近のコミットから package.json を復元してくれる。

こんな感じでコミット履歴から該当するファイルをコミットしたものだけフィルタリングできる。この仕組みを利用している。

```
git log -- "package.json"
```

## おまけ

普段から zsh を使っていて `g` だけで git コマンドを呼び出せるように下記の関数を `.zshrc` に登録している。

```bash
function g () {
  if [[ $# > 0 ]]
  then
    git $@
  else
    git s
  fi
}
compdef g=git
```

`compdef g=git` をすることで git コマンドの補完も使えるようにしている。

ちなみに `g` だけタイプすると手元の状態をシンプルなフォーマットで表示してくれる。これは [@trueymt2](https://twitter.com/trueymt2) さんから教えてもらって便利に使っている。

```
s = status -s
```

https://github.com/Code-Hex/dotfiles
