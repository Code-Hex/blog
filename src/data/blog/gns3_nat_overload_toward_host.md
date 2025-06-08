---
title: 特定のホストのみ NAT overload（PAT）を実行する
pubDatetime: 2024-10-15T01:31:46.000+09:00
featured: false
draft: false
tags:
  - network
  - gns3
  - cef
  - nat
description: GNS3 上で特定のホストにのみ NAT overload（PAT）を実行する方法を検証してみました。途中設定を間違えていたことで CEF についても学ぶきっかけを得たので、おまけとして載せました。
---

[NAT Overload Towards Specific Host](https://lostintransit.se/2024/09/23/nat-overload-towards-specific-host/) を読んだ。

この記事では、特定のホストに対してのみ NAT overload (PAT) を行う方法について記されている。

![](https://storage.googleapis.com/zenn-user-upload/59be53850200-20241015.png)

内部ネットワーク 10.10.1.0/24 に属するホストがあり、外部のサーバーとして 192.168.0.1 が存在する。これらは直接の接続がないため、ルーター (192.168.128.103) を経由して接続を行う。しかし、すべてのトラフィックを許可するのではなく、内部ネットワーク 10.10.1.0/24 に属するホストから、サーバーである 192.168.0.1 への通信だけ PAT を行いたい要件があり、その設定について解説されていた。

この記事では、上記の記事の内容を基に GNS3 上で特定のホストにのみ NAT overload（PAT）を実行する方法を検証してみた。トポロジーの画像は添付されていたが、細かい設定について記述はされてなかったため、これらに関しては自分で考えて実践した。

- 内部ネットワークは 10.10.1.0/24
- ネットワーク内のホストが 192.168.0.1 のホストにアクセスする必要がある
  - 直接接続できないため 192.168.128.103 のルーターの背後で PAT を行う必要がある
  - ただし 10.10.1.0/24 からのすべてのトラフィックを PAT しない
- 192.168.128.0/24 には、PC が元のソースアドレスを使用してアクセスすべきホストが存在する

R1, R2 はルーターで DS1 は L3 スイッチである。すべて c3725 である。

## 検証環境準備

### R1, R2 間の通信を行えるようにする

**R1**

```
R1#conf t
R1(config)#int f2/0
R1(config-if)#ip address 192.168.128.103 255.255.255.0
R1(config-if)#no shutdown
R1(config-if)#do ping 192.168.128.1

Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 192.168.128.1, timeout is 2 seconds:
.!!!!
Success rate is 80 percent (4/5), round-trip min/avg/max = 8/29/56 ms
```

**R2**

```
R2#conf t
R2(config)#int f2/0
R2(config-if)#ip address 192.168.128.1 255.255.255.0
R2(config-if)#no shutdown
R2(config-if)#do ping 192.168.128.103

Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 192.168.128.103, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 20/20/24 ms
```

### R2, Server 間の通信を行えるようにする

**R2**

```
R2(config-if)#int f0/0
R2(config-if)#ip address 192.168.0.254 255.255.255.0
R2(config-if)#no shutdown
R2(config-if)#exit
R2(config)#ip route 0.0.0.0 0.0.0.0 192.168.128.103
R2(config)#do show ip route
Codes: C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area
       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
       E1 - OSPF external type 1, E2 - OSPF external type 2
       i - IS-IS, su - IS-IS summary, L1 - IS-IS level-1, L2 - IS-IS level-2
       ia - IS-IS inter area, * - candidate default, U - per-user static route
       o - ODR, P - periodic downloaded static route

Gateway of last resort is 192.168.128.103 to network 0.0.0.0

C    192.168.128.0/24 is directly connected, FastEthernet2/0
C    192.168.0.0/24 is directly connected, FastEthernet0/0
S*   0.0.0.0/0 [1/0] via 192.168.128.103
```

**Server**

```
Server> ip 192.168.0.1/24 192.168.0.254
Checking for duplicate address...
Server : 192.168.0.1 255.255.255.0 gateway 192.168.0.254

Server> ping 192.168.0.254

192.168.0.254 icmp_seq=1 timeout
84 bytes from 192.168.0.254 icmp_seq=2 ttl=255 time=17.631 ms
84 bytes from 192.168.0.254 icmp_seq=3 ttl=255 time=4.448 ms
84 bytes from 192.168.0.254 icmp_seq=4 ttl=255 time=8.322 ms
84 bytes from 192.168.0.254 icmp_seq=5 ttl=255 time=10.620 ms
```

### R1, DS1, PC 間の通信を行えるようにする

**R1**

```
R1(config)#int f1/0
R1(config-if)#ip address 10.10.3.1 255.255.255.252
R1(config-if)#no shutdown
R1(config-if)#do ping 10.10.3.2

Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 10.10.3.2, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 20/25/48 ms
R1(config)#ip route 10.10.1.0 255.255.255.0 10.10.3.2
R1(config)#do ping 10.10.1.10

Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 10.10.1.10, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 32/52/132 ms
```

`ip route 10.10.1.0 255.255.255.0 10.10.3.2` を設定することで、R1 から 10.10.1.0/24 へのルーティングは DS1 を経由して転送が行われるようになる。これで PC から R1 (10.10.3.1) へ ping が通るようになる。

**DS1**

```
DS1#conf t
DS1(config)#int f1/0
DS1(config-if)#ip address 10.10.3.2 255.255.255.252
DS1(config-if)#no shutdown
DS1(config-if)#do ping 10.10.3.1

Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 10.10.3.1, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 20/233/1076 ms
DS1(config-if)#int f1/1
DS1(config-if)#ip address 10.10.1.1 255.255.255.0

% IP addresses may not be configured on L2 links.

DS1(config-if)#no switchport
DS1(config-if)#ip address 10.10.1.1 255.255.255.0
DS1(config)#ip routing
DS1(config)#ip route 0.0.0.0 0.0.0.0 10.10.3.1
```

`no switchport` と `ip routing` を設定することで L3 スイッチとして振る舞うように設定した。

**PC**

```
PC> ip 10.10.1.10/24 10.10.1.1
Checking for duplicate address...
PC : 10.10.1.10 255.255.255.0 gateway 10.10.1.1
PC> ping 10.10.1.1

84 bytes from 10.10.1.1 icmp_seq=1 ttl=255 time=10.199 ms
84 bytes from 10.10.1.1 icmp_seq=2 ttl=255 time=10.022 ms
84 bytes from 10.10.1.1 icmp_seq=3 ttl=255 time=8.388 ms
84 bytes from 10.10.1.1 icmp_seq=4 ttl=255 time=12.888 ms
84 bytes from 10.10.1.1 icmp_seq=5 ttl=255 time=9.948 ms
PC> ping 10.10.3.1

84 bytes from 10.10.3.1 icmp_seq=1 ttl=254 time=147.785 ms
84 bytes from 10.10.3.1 icmp_seq=2 ttl=254 time=24.546 ms
84 bytes from 10.10.3.1 icmp_seq=3 ttl=254 time=12.984 ms
84 bytes from 10.10.3.1 icmp_seq=4 ttl=254 time=25.504 ms
84 bytes from 10.10.3.1 icmp_seq=5 ttl=254 time=25.116 ms
```

### R1, Server 間の通信を行えるようにする

```
R1(config)#ip route 192.168.0.0 255.255.255.0 192.168.128.1
```

## PAT の設定

**R1**

静的 NAT の設定をすると `NAT: Error activating CNBAR on the interface FastEthernet1/0` といったエラーなどがたくさん出てきた。調べてみるとメモリが足りないのが原因ようだった。 RAM Size が 128 MiB になっていたので 256 MiB へ増やすとうまく動作するようになった。R1 の再起動前に `do wr` で設定を保存する。

https://ameblo.jp/cm116149111/entry-11609393112.html

メモリを増やした後に 10.10.1.0/24 のネットワークからホスト 192.168.0.1 へのみ PAT が行えるように設定する。

```
R1(config)#int f1/0
R1(config-if)#ip nat inside
R1(config-if)#int f2/0
R1(config-if)#ip nat outside
R1(config-if)#exit
R1(config)#ip access-list extended NAT-SRC-10.10.1.0/24
R1(config-ext-nacl)#permit ip 10.10.1.0 0.0.0.255 host 192.168.0.1
```

最後に元の記事でも記されていた通り、設定した ACL を利用するように PAT を構成する。[^1]

```
R1(config)#ip nat inside source list NAT-SRC-10.10.1.0/24 interface f2/0 overload
```

[^1]: `ip nat inside source list` で指定する interface は必ず outside のものを指定する。もし間違えると長時間ハマってしまう。

R1 にて `debug ip nat detailed` を有効にした後、PC から Server へ ping を試してみると PAT が動作している様子がコンソール上で確認できる。

```
R1(config)#
*Mar  1 04:39:24.774:  mapping pointer available mapping:0
*Mar  1 04:39:24.774: NAT: [0] Allocated Port for 10.10.1.10 -> 192.168.128.103: wanted 7496 got 7496
*Mar  1 04:39:24.774: NAT*: i: icmp (10.10.1.10, 7496) -> (192.168.0.1, 7496) [18461]
*Mar  1 04:39:24.778: NAT*: i: icmp (10.10.1.10, 7496) -> (192.168.0.1, 7496) [18461]
*Mar  1 04:39:24.778: NAT*: s=10.10.1.10->192.168.128.103, d=192.168.0.1 [18461]
*Mar  1 04:39:24.794: NAT*: o: icmp (192.168.0.1, 7496) -> (192.168.128.103, 7496) [18461]
*Mar  1 04:39:24.794: NAT*: s=192.168.0.1, d=192.168.128.103->10.10.1.10 [18461]
```

### ACL にマッチしないトラフィックはどうなるか

Server2 は 192.168.0.2 の IP アドレスを持っている。一番最初に R1 に `ip route 192.168.0.0 255.255.255.0 192.168.128.1` のルーティング情報を与えた。この場合、PC から Server2 へ ping を送ると PAT を通らず、**通常通りルーティングされる**。

ルーティング情報を代わりに `ip route 192.168.0.1 255.255.255.255 192.168.128.1` とした場合、192.168.0.1 以外の経路は存在しないため、トラフィックは PAT を経由しないと 192.168.0.0/24 のネットワークへトラフィックを送れなくなる。よって 192.168.0.1 である Server のみへ ping の疎通を行える。

## おまけ

`ip nat inside source list` で指定する interface を inside の interface を指定してたことで、かなり長い時間ハマった。このときなぜか CEF を無効にすることで PAT が成立することを知った。色々調べたが理由はわかっていない。

- PAT を解除すると普通に ping が PC -> Server と Server -> PC の両方で通る
- `ip nat inside source static 10.10.1.10 192.168.128.103` で通る
  - ただし、192.168.0.0/24 に複数ホストがあると、192.168.0.1 以外にも ping が通ってしまう
- `ip access-list extended NAT-SRC-10.10.1.0/24 interface f1/0` [^2] を `permit ip any any` へ変更して PAT の再適用でも通らない

[^2]: inside の interface を指定してしまってる。

Claude へトポロジーを詳細に記述して、投げてみたところ `ip cef` を無効にしてみる案を提示してくれた。`no ip cef` を試したところ見事 ping が通るようになった。なぜ通るようになったか色々理由を探してみたが見つけられなかった。どうやら Cisco ルーターは大きく [CEF (Cisco Express Forwarding)](https://en.wikipedia.org/wiki/Cisco_Express_Forwarding) とプロセススイッチングと呼ばれるパケットの処理方法があることがわかった。

| 特性             | プロセススイッチング                                 | CEF (Cisco Express Forwarding)           |
| ---------------- | ---------------------------------------------------- | ---------------------------------------- |
| 動作方式         | 各パケットをCPUが個別に処理                          | FIB（Forwarding Information Base）を使用 |
| パケット処理     | パケットごとにルーティングテーブルを参照             | 事前計算された転送情報を使用             |
| 処理速度         | 遅い                                                 | 高速                                     |
| CPU負荷          | 高い                                                 | 低い                                     |
| メモリ使用量     | 比較的少ない                                         | 多い（FIBとadjacencyテーブルのため）     |
| 柔軟性           | 高い（複雑な処理に対応可能）                         | 一般的なケースに最適化                   |
| スケーラビリティ | 低い                                                 | 高い                                     |
| 主な用途         | デバッグ、トラブルシューティング、特殊なパケット処理 | 一般的なルーティング、大規模ネットワーク |
| 例外処理         | 適している                                           | 一部の例外的なケースでは不向き           |

`no ip route-cache` を実行すると、指定した interface で CEF (Cisco Fast Express) も無効になり、プロセススイッチングを行うようになる。このおかげか PAT が成立するようになった。
