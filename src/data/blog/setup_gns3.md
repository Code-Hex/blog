---
title: GNS3 を M2 macOS Sonoma 14.5 でセットアップ
pubDatetime: 2024-08-12T22:28:26.000+09:00
featured: false
draft: false
tags:
  - network
  - gns3
description: GNS3 を M2 Mac でセットアップし、VMWare で GNS3 サーバーを構築。Cisco の IOS ルーターを使用し、VPC 間通信をシミュレーションする手順を説明。
---

Cisco の機器をシミュレーションするためのツール GNS3 を M2 macOS Sonoma 14.5 でセットアップしたメモ。

GNS3 とは、Cisco を始め、OpenWrt といったルータやスイッチなどのネットワーク機器をシミュレーションするためのツールである。これを使うことで、実際の機器を用意することなく、ネットワークの構築や設定を行うことが可能。

## 準備するもの

GNS3 は https://github.com/GNS3/gns3-gui/releases からダウンロードできる。今回は macOS 版を使うため、`GNS3-2.2.49.dmg` をダウンロードした。

ここで GNS3 は GUI とサーバーの 2 つのコンポーネントで構成されている。GUI はユーザーインターフェースを提供し、サーバーは実際のシミュレーションを行うエンジンである。

サーバーはローカルで動かすこともできるが、リモートで動かすこともできる。リモート環境として VMWare に構築した GNS3 サーバーを使うことにした。よって同じページから `GNS3.VM.ARM64.2.2.49.zip` もダウンロードした。

なぜこうするかというと、GNS3 は [vpcs](https://github.com/GNS3/vpcs) という仮想の PC を使ってネットワーク機器を接続することができるが、これが arm 環境の macOS では動かないためである。

https://www.gns3.com/community/discussions/vpcs-console-doesnt-work-in-mac-m1

よって GNS3 以外には VMWare をインストールした。VMware を選ぶ理由にインテグレーションが GNS3 側に用意されていることと、 VMWare Fusion Pro の個人利用版が無償になった(2024 年 5 月)ことが大きい。

こちらの記事を参考に VMWare をインストールする。

https://qiita.com/sanjushi003/items/b4ba2687f99412fd7c38

## IOS router のセットアップ

GNS3 では Cisco の IOS イメージを使ってルータをシミュレーションすることができる。Cisco IOS のイメージは以下の入手方法がある。

- Cisco の公式サイトからダウンロードできるが、これは有料
- Cisco の機器を購入し、iso イメージを抜き出す
  - 優しい友人がいれば協力して手に入れられる
- ネット上で見つけることも可能らしいが、違法性が高いので非推奨

手に入れたら以下の手順で GNS3 に登録する。リンク先は Windows だが macOS でも同じように追加できた。

https://zenn.dev/y_mrok/books/gns3-no-tsukaikata/viewer/chapter4

## VMWare で GNS3 サーバーを起動

先ほどダウンロードした `GNS3.VM.ARM64.2.2.49.zip` を解凍すると画像のような `.vmdk` ファイルが 2 つ出てくる。

![](https://storage.googleapis.com/zenn-user-upload/9996617cdcf4-20240812.png)

これらのファイルを「[vmware fusionにVMをインポート](https://qiita.com/tarachan291/items/b16bdea5a0a1888a641d#2-vmware-fusion%E3%81%ABvm%E3%82%92%E3%82%A4%E3%83%B3%E3%83%9D%E3%83%BC%E3%83%88)」の記事に従って VMWare にインポートする。メモリは 2GB に設定した。

「3. GNS3クライアントをインストール」以降は不要なので読まない。

サーバーを起動すると以下のような画面が表示される。

![](https://storage.googleapis.com/zenn-user-upload/6611b96d1571-20240812.png)

`Information` へカーソルを合わせてエンターキーを押すと以下の画像のように IP アドレスが表示される。これを GNS3 GUI クライアントに登録する。

![](https://storage.googleapis.com/zenn-user-upload/2cdedca3557c-20240812.png)

GNS3 クライアントの設定（GNS3 > ⚙️ Preferences...）を開き、`Server` を選んで `Main server` タブを選ぶ。以下の画像のように VMWare に構築したサーバー情報を表示する。

- Enable local server のチェックを外す
- Auth はチェック不要。チェックする場合、User, Pass は共に gns3 がデフォルトになるらしい

![](https://storage.googleapis.com/zenn-user-upload/520f17bd1202-20240812.png)

## 簡単なネットワーク構築

ちゃんと設定できたか確認するために、簡単なネットワークを構築してみる。最終的には以下のような構成になる。

![](https://storage.googleapis.com/zenn-user-upload/7fded67c8f67-20240812.png)

- **PC1:**

  - IPアドレス: 192.168.1.2
  - MACアドレス: 00:50:79:66:68:00
  - 接続先: R1 ルーターの f0/0 インターフェース

- **R1ルーター:**

  - f0/0 インターフェース: IP アドレス 192.168.1.1, 接続先: PC1
  - f1/0 インターフェース: IP アドレス 10.0.0.1, 接続先: R2 ルーターの f0/0 インターフェース

- **R2ルーター:**

  - f0/0 インターフェース: IP アドレス 10.0.0.2, 接続先: R1 ルーターの f1/0 インターフェース
  - f1/0 インターフェース: IP アドレス 192.168.2.1, 接続先: PC2

- **PC2:**
  - IPアドレス: 192.168.2.2
  - MACアドレス: 00:50:79:66:68:01
  - 接続先: R2 ルーターの f1/0 インターフェース

この構成では、PC1 と PC2 はそれぞれ異なるサブネットにあり、ルーター R1 と R2 を介して通信が可能になっている。

右にある console ペインがそれぞれの機器のコンソールへの接続情報になっている。例えば PC1 へ接続する場合、mac のターミナル上で `telnet 192.168.103.128 5000` といったコマンドを実行すると接続できる。

画像のようにそれぞれ接続して設定を行う。なお、ルーターに関しては以下の GIF のように Slot を増やしてリンクさせる設定を行う。

![](https://storage.googleapis.com/zenn-user-upload/4352f84179f3-20240812.gif)

### R1, R2 を設定する

PC1 と PC2 間で ping を通すためにルーターのインターフェースをそれぞれ設定する必要がある。

- ルーターのインターフェースを設定する
  - R1 と R2 のインターフェースに IP アドレスを割り当てる
  - インターフェースを "no shutdown" コマンドで有効化
- ルーティングの設定
  - スタティックルートを設定

R1 にスタティックルートを設定する手順

```
R1(config)# interface f0/0
R1(config-if)# ip address 192.168.1.1 255.255.255.0
R1(config-if)# no shutdown
R1(config-if)# exit
R1(config)# interface f1/0
R1(config-if)# ip address 10.0.0.1 255.255.255.252
R1(config-if)# no shutdown
R1(config-if)# exit
R1(config)# ip route 192.168.2.0 255.255.255.0 10.0.0.2
R1(config)# end
R1# show ip interface brief
Interface                  IP-Address      OK? Method Status                Protocol
FastEthernet0/0            192.168.1.1     YES manual up                    up
FastEthernet1/0            10.0.0.1        YES manual up                    up
```

同様に R2 にも設定を行う。

```
R2(config)# interface f1/0
R2(config-if)# ip address 192.168.2.1 255.255.255.0
R2(config-if)# no shutdown
R2(config-if)# exit
R2(config)# interface f0/0
R2(config-if)# ip address 10.0.0.2 255.255.255.252
R2(config-if)# no shutdown
R2(config-if)# exit
R2(config)# ip route 192.168.1.0 255.255.255.0 10.0.0.1
R2(config)# end
R2#show ip interface brief
Interface                  IP-Address      OK? Method Status                Protocol
FastEthernet0/0            10.0.0.2        YES manual up                    up
FastEthernet1/0            192.168.2.1     YES manual up                    up
```

### PC1, PC2 を設定する

PC1 と PC2 に IP アドレス、サブネットマスク、デフォルトゲートウェイを設定する。

```
PC1> show ip

NAME        : PC1[1]
IP/MASK     : 0.0.0.0/0
GATEWAY     : 0.0.0.0
DNS         :
MAC         : 00:50:79:66:68:00
LPORT       : 20000
RHOST:PORT  : 127.0.0.1:20001
MTU         : 1500

PC1> ip 192.168.1.2 255.255.255.0 192.168.1.1
PC1 : 192.168.1.2 255.255.255.0 gateway 192.168.1.1
PC1> show ip

NAME        : PC1[1]
IP/MASK     : 192.168.1.2/24
GATEWAY     : 192.168.1.1
DNS         :
MAC         : 00:50:79:66:68:00
LPORT       : 20000
RHOST:PORT  : 127.0.0.1:20001
MTU         : 1500

```

PC2 も同様に。

```
PC2> ip 192.168.2.2 255.255.255.0 192.168.2.1
Checking for duplicate address...
PC2 : 192.168.2.2 255.255.255.0 gateway 192.168.2.1
PC2> show ip

NAME        : PC2[1]
IP/MASK     : 192.168.2.2/24
GATEWAY     : 192.168.2.1
DNS         :
MAC         : 00:50:79:66:68:01
LPORT       : 20016
RHOST:PORT  : 127.0.0.1:20017
MTU         : 1500

```

VPC の設定を保存するには、`save` コマンドを実行する。

### 確認

接続テストで `PC1> ping 192.168.2.2` を実行すると、通信が成功する確認できる。

上手くいってる時のルーティングテーブルの表示に `show ip route` を利用する。

**R1:**

```
R1#show ip route
Codes: C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area
       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
       E1 - OSPF external type 1, E2 - OSPF external type 2
       i - IS-IS, su - IS-IS summary, L1 - IS-IS level-1, L2 - IS-IS level-2
       ia - IS-IS inter area, * - candidate default, U - per-user static route
       o - ODR, P - periodic downloaded static route

Gateway of last resort is not set

     10.0.0.0/24 is subnetted, 1 subnets
C       10.0.0.0 is directly connected, FastEthernet1/0
C    192.168.1.0/24 is directly connected, FastEthernet0/0
S    192.168.2.0/24 [1/0] via 10.0.0.2
```

**R2:**

```
R2#show ip route
Codes: C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area
       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
       E1 - OSPF external type 1, E2 - OSPF external type 2
       i - IS-IS, su - IS-IS summary, L1 - IS-IS level-1, L2 - IS-IS level-2
       ia - IS-IS inter area, * - candidate default, U - per-user static route
       o - ODR, P - periodic downloaded static route

Gateway of last resort is not set

     10.0.0.0/24 is subnetted, 1 subnets
C       10.0.0.0 is directly connected, FastEthernet0/0
S    192.168.1.0/24 [1/0] via 10.0.0.1
C    192.168.2.0/24 is directly connected, FastEthernet1/0
```
