---
pubDatetime: 2023-11-25T19:00:00+09:00
title: ISUCON 13 参加した
postSlug: isucon13
featured: false
draft: false
tags:
  - isucon
description: ISUCON 13 にチーム太郎で参加して大敗しました。
---

- [ISUCON13 まとめ : ISUCON 公式 Blog](https://isucon.net/archives/57801192.html)
- [ISUCON13 参加した - ごみばこいん](https://gomiba.co/archives/2023/11/c0a9f078-c9da-4623-803a-d1c34190e9de/)

チーム太郎でやりました。楽しかった。お疲れ様でした。ありがとうございました。

## やったこと

Go を使って参加しました。

### Tags をインメモリで持つようにした

このコードを `init` 関数の中で呼び出すようにした。

```go
// グローバル
var tags []*Tag


tagNames := []string{
    "ライブ配信", "ゲーム実況", "生放送", "アドバイス", "初心者歓迎", ...
}
tags := make([]*Tag, len(tagNames))
for idx, name := range tagNames {
	tags[idx] = &Tag{
		ID:   int64(idx) + 1,
		Name: name,
	}
}
```

### themes テーブルを削除して users テーブルへ持っていった

themes テーブルは AUTO INCREMENT で ID が設定されており、users テーブルと同じ件数であった。users テーブルから user 情報を引くことが前提の処理が多かったので、users テーブルに ``dark_mode` BOOLEAN NOT NULL` を追加して、ID は users の ID を返すようにエンドポイントを修正。

### icons テーブルを使わず、username をファイル名にして静的配信

Go では [http.ServeContent](https://pkg.go.dev/net/http#ServeContent) を使えば `If-None-Match` に対応したレスポンスにしてくれるので、これを使ってレスポンスを返すようにしました。

S3 サーバーっぽい感じのアプリケーションサーバーを 2 台目のサーバーに設置した。それ以外にデプロイされたアプリケーションサーバーはこの 2 台目に対してリクエストを投げて返ってきたレスポンスをそのまま返すようにした。

```go
package main

const listenPort = 8080
const fallbackImage = "../img/NoImage.jpg"

func main() {
	e := echo.New()

	e.GET("/healthz", func(c echo.Context) error {
		return c.JSON(200, map[string]string{"status": "OK"})
	})

	e.GET("/reset", func(c echo.Context) error {
		resetIcons()
		return c.JSON(http.StatusOK, map[string]string{})
	})

	e.GET("/api/user/:username/icon", func(c echo.Context) error {
		username := c.Param("username")

		path, err := getIconPath(username)
		if err != nil {
			if errors.Is(err, os.ErrNotExist) {
				return c.File(fallbackImage)
			}
			return echo.NewHTTPError(http.StatusInternalServerError, "failed to get user: "+err.Error())
		}

		return c.File(path)
	})

	e.POST("/api/user/:username/icon", func(c echo.Context) error {
		username := c.Param("username")
		name := filepath.Join(iconsPath, username+".jpg")
		f, err := os.Create(name)
		if err != nil {
			return err
		}
		defer f.Close()

		io.Copy(f, c.Request().Body)

		return c.JSON(http.StatusOK, map[string]string{})
	})

	// HTTPサーバ起動
	listenAddr := net.JoinHostPort("", strconv.Itoa(listenPort))
	if err := e.Start(listenAddr); err != nil {
		e.Logger.Errorf("failed to start HTTP server: %v", err)
		os.Exit(1)
	}
}

const iconsPath = "images/icons"

func getIconPath(username string) (string, error) {
	name := filepath.Join(iconsPath, username+".jpg")
	if _, err := os.Stat(name); err != nil {
		return "", err
	}
	return name, nil
}

func resetIcons() {
	os.RemoveAll(iconsPath)
	os.MkdirAll(iconsPath, 0700)
}
```

### moderate の追加

- 過去に追加された ngwords を見る必要がなかったのでループを削除した。
- コメントに ngword があった livecomment の ID をスライスに詰め込み、長さが 1 以上あれば `DELETE FROM livecomments` と `UPDATE ranking_livestreams` を `IN` 句を使って実行するように修正した。

### その他

- 複数台構成
- DB サーバー設定
- デプロイ周りの修正

## 感想

- DNS 周りは対応する時間がなかったので、他の前提の問題を解決するための力不足を感じた。
- 統計周りの N + 1 のロジックが難しく、解きほぐすロジックを考えるのも難しかった。
- 最後は fail して終わったので悔しかった。来年も開催されるなら参加したい！
