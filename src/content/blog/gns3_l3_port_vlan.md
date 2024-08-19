---
title: 異なるポート VLAN 間の通信を GNS3 で実験する
pubDatetime: 2024-08-19T21:51:31.000+09:00
featured: false
draft: false
tags:
  - network
  - gns3
description: GNS3 上で L3 スイッチを使って3つのスイッチポートへ VLAN を割り当て、異なるポート VLAN に存在する PC の通信を実験しました。
---

[GNS3](https://www.gns3.com/) を利用してポート VLAN を作成し、スイッチポートに割り当てる。割り当てたスイッチポートを PC へリンクして異なる VLAN に属した2台の PC 同士で ping を送り合えるようになるまで設定を行う。

最終的にはこの構成図になった。

![](https://storage.googleapis.com/zenn-user-upload/12ccfde1e184-20240819.png)

PC3 は完全に思いつきだが、同じ VLAN 内だとルーティング機能が有効になってなくても、通信ができるかどうかを確認するために用意した。異なる VLAN 間にある端末同士で疎通ができるかどうか検証する場合、PC1 と PC2 の設定のみで十分。

## L3 スイッチの準備

Catalyst を利用せずとも c3725 を使えば L3 スイッチとしてルーターを振る舞うように設定ができる。[GNS3におけるスイッチの設定](https://owlcamp.jp/gns3-switch/)を参考に設定した。

![](https://storage.googleapis.com/zenn-user-upload/3d25a5a39464-20240819.png)

この場合、Catalyst と違って `show vlan` コマンドが利用できなかった。代わりに `show vlan-switch` を利用して確認できた。

![](https://storage.googleapis.com/zenn-user-upload/876e421adee2-20240819.png)

## VLAN の設定

VLAN を2つ作成し、いくつかのインターフェースへ割り当ててみる。

### デフォルト VLAN

`vlan 1` は触らない。`vlan 1` は基本的にデフォルト VLAN として割り当てられてるため、いくつかの不便が生じてしまうからである。

1. 一部設定の変更ができない

以下のようにデフォルト VLAN の名前を変えようとしても弾かれる。

```
ESW1(config)#vlan 1
ESW1(config-vlan)#name vlan1
Default VLAN 1 may not have its name changed.
```

2. 大部分のインターフェースへ割り当てられているため設定事項が増える

新しく VLAN を割り当てて設定していくのとは異なってデフォルトでいくつか設定されている。不都合な設定のみを取り消すようなブラックリスト形式で作業していく必要があり、どんな設定が反映されているかを把握してないといけないことがあるため難しい。

抜け漏れによるセキュリティリスクもありそう。以下は初期設定直後のデフォルト VLAN の情報。ほぼ全てのインターフェースへ割り当てられている事がわかる。

```
ESW1#show vlan-switch brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Fa1/0, Fa1/1, Fa1/2, Fa1/3
                                                Fa1/4, Fa1/5, Fa1/6, Fa1/7
                                                Fa1/8, Fa1/9, Fa1/10, Fa1/11
                                                Fa1/12, Fa1/13, Fa1/14, Fa1/15
1002 fddi-default                     act/unsup
1003 token-ring-default               act/unsup
1004 fddinet-default                  act/unsup
1005 trnet-default                    act/unsup
```

### VLAN の作成

コンフィグレーションモードへ入って、VLAN を設定する。今回は2つの VLAN を設置したいため vlan 2 と 3 へ名前をつけた。名前をつけた事がわかるように `codehex`（自分の username）を suffix にする。

```
ESW1#conf t
(config)# vlan 2
(config-vlan)name vlan2-codehex
ESW1(config)#vlan 3
ESW1(config-vlan)#name vlan3-codehex
ESW1(config-vlan)#exit
ESW1(config)#end
ESW1#show vlan-switch brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Fa1/0, Fa1/1, Fa1/2, Fa1/3
                                                Fa1/4, Fa1/5, Fa1/6, Fa1/7
                                                Fa1/8, Fa1/9, Fa1/10, Fa1/11
                                                Fa1/12, Fa1/13, Fa1/14, Fa1/15
2    vlan2-codehex                    active
3    vlan3-codehex                    active
1002 fddi-default                     act/unsup
1003 token-ring-default               act/unsup
1004 fddinet-default                  act/unsup
1005 trnet-default                    act/unsup
```

それぞれの VLAN を Fa1/0, Fa1/1 インターフェースへポート VLAN として割り当てていく。

```
ESW1#conf t
Enter configuration commands, one per line.  End with CNTL/Z.
ESW1(config)#int fa1/0
ESW1(config-if)#switchport mode access
ESW1(config-if)#switchport access vlan 2
ESW1(config-if)#exit
ESW1(config)#int fa1/1
ESW1(config-if)#sw mode access
ESW1(config-if)#sw access vlan 3
ESW1(config-if)#exit
ESW1(config)#end
ESW1#
*Mar  1 00:47:14.759: %SYS-5-CONFIG_I: Configured from console by console
ESW1#show vlan-switch brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Fa1/2, Fa1/3, Fa1/4, Fa1/5
                                                Fa1/6, Fa1/7, Fa1/8, Fa1/9
                                                Fa1/10, Fa1/11, Fa1/12, Fa1/13
                                                Fa1/14, Fa1/15
2    vlan2-codehex                    active    Fa1/0
3    vlan3-codehex                    active    Fa1/1
1002 fddi-default                     act/unsup
1003 token-ring-default               act/unsup
1004 fddinet-default                  act/unsup
1005 trnet-default                    act/unsup
```

続いて VLAN へ IP アドレスを割り当てていく。

```
ESW1#conf t
Enter configuration commands, one per line.  End with CNTL/Z.
ESW1(config)#int vlan 2
ESW1(config-if)#ip address 192.168.10.12 255.255.255.0
ESW1(config-if)#exit
ESW1(config)#int vlan 3
ESW1(config-if)#ip address 192.168.20.33 255.255.255.0
ESW1(config-if)#exit
ESW1(config)#end
```

`show run` (`show running-config`) で設定を確認する。

```
...
!
interface Vlan1
 no ip address
 no ip route-cache
 shutdown
!
interface Vlan2
 ip address 192.168.10.12 255.255.255.0
!
interface Vlan3
 ip address 192.168.20.33 255.255.255.0
!
...
```

デフォルトゲートウェイとなる IP アドレスも設定できてることを確認した。

### PC の設定

PC1 と PC2 に IP アドレス、サブネットマスク、デフォルトゲートウェイを設定する。

PC1 に fa1/0 (VLAN 2)、PC2 に fa1/1 (VLAN 3)をそれぞれ接続されていることを想定する。そこで PC1 には VLAN 2 のサブネットマスクに収まる IP アドレスを割り振る。今回は `192.168.10.100` とした。PC2 は `192.168.20.110` を割り振る。

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

PC1> ip 192.168.10.100 255.255.255.0 192.168.10.12
PC1 : 192.168.10.100 255.255.255.0 gateway 192.168.10.12
PC1> show ip

NAME        : PC1[1]
IP/MASK     : 192.168.10.100/24
GATEWAY     : 192.168.10.12
DNS         :
MAC         : 00:50:79:66:68:00
LPORT       : 20000
RHOST:PORT  : 127.0.0.1:20001
MTU         : 1500
```

## ルーティングの設定

ルーティング機能を持った L3 スイッチを利用しているため、VLAN 間でもルーティングを行えるように設定する。その前に異なる VLAN に属している PC1, PC2 同士で ping できるか確認する。

```
ESW1#show int fa1/0 | include line
FastEthernet1/0 is up, line protocol is up
ESW1#show int fa1/1 | include line
FastEthernet1/1 is up, line protocol is up
ESW1#show ip route
Default gateway is not set

Host               Gateway           Last Use    Total Uses  Interface
ICMP redirect cache is empty
```

VLAN を設定したインターフェースが起動されていて利用可能な状態になっていることを確認した。しかし、現在はルーティング機能が無効になっているため、PC1 と PC2 間で ping ができないことを確認する。

```
PC1> ping 192.168.20.110

192.168.20.110 icmp_seq=1 timeout
192.168.20.110 icmp_seq=2 timeout
192.168.20.110 icmp_seq=3 timeout
192.168.20.110 icmp_seq=4 timeout
192.168.20.110 icmp_seq=5 timeout

PC1>
```

ここで新たに VLAN 2 に属した PC3 を追加してみる。fa1/2 を VLAN 2 のポートにして PC3 とリンクした。

```
ESW1#conf t
Enter configuration commands, one per line.  End with CNTL/Z.
ESW1(config)#int fa1/2
ESW1(config-if)#switchport access vlan 2
ESW1(config-if)#switchport mode access
ESW1(config-if)#no shutdown
ESW1(config-if)#end
ESW1#show int fa1/2 | include line
FastEthernet1/2 is up, line protocol is down
ESW1#conf t
Enter configuration commands, one per line.  End with CNTL/Z.
ESW1(config)#int fa1/2
ESW1(config-if)#shutdown
ESW1(config-if)#no shutdown
ESW1(config-if)#end
ESW1#
ESW1#show int fa1/2 | include line
FastEthernet1/2 is up, line protocol is up
```

`line protocol is down` になっていたため `shutdown` -> `no shutdown` とインターフェースを再起動した。PC3 には `192.168.10.101` を割り振る。

```
PC3> ip 192.168.10.101 255.255.255.0 192.168.10.12
PC3> show ip

NAME        : PC3[1]
IP/MASK     : 192.168.10.101/24
GATEWAY     : 192.168.10.12
DNS         :
MAC         : 00:50:79:66:68:02
LPORT       : 20016
RHOST:PORT  : 127.0.0.1:20017
MTU         : 1500

PC3>
```

ここで同じ VLAN 2 に属する PC3 (`192.168.10.101`) から PC1 (`192.168.10.100`) へ ping を送る。

```
PC3> ping 192.168.10.100

84 bytes from 192.168.10.100 icmp_seq=1 ttl=64 time=0.440 ms
84 bytes from 192.168.10.100 icmp_seq=2 ttl=64 time=0.241 ms
84 bytes from 192.168.10.100 icmp_seq=3 ttl=64 time=0.345 ms
84 bytes from 192.168.10.100 icmp_seq=4 ttl=64 time=0.306 ms
84 bytes from 192.168.10.100 icmp_seq=5 ttl=64 time=0.247 ms

PC3>
```

疎通が取れる事が確認できた。今度は異なる VLAN の PC2 (`192.168.20.110`) へ ping を送る。

```
PC3> ping 192.168.20.110

192.168.20.110 icmp_seq=1 timeout
192.168.20.110 icmp_seq=2 timeout
192.168.20.110 icmp_seq=3 timeout
192.168.20.110 icmp_seq=4 timeout
192.168.20.110 icmp_seq=5 timeout

PC3>
```

ルーティングが無効になっていることで異なる VLAN 間での ping は失敗することを確認できた。ここで L3 スイッチの設定でルーティングを有効にする。

```
ESW1#conf t
Enter configuration commands, one per line.  End with CNTL/Z.
ESW1(config)#ip routing
ESW1(config)#^Z
ESW1#
ESW1#show ip route
Codes: C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area
       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
       E1 - OSPF external type 1, E2 - OSPF external type 2
       i - IS-IS, su - IS-IS summary, L1 - IS-IS level-1, L2 - IS-IS level-2
       ia - IS-IS inter area, * - candidate default, U - per-user static route
       o - ODR, P - periodic downloaded static route

Gateway of last resort is not set

C    192.168.10.0/24 is directly connected, Vlan2
C    192.168.20.0/24 is directly connected, Vlan3
```

`show ip route` の結果が `connected` へ更新された。PC3 から PC2 へ ping ができるようになったか確認してみる。

```
PC3> ping 192.168.20.110

192.168.20.110 icmp_seq=1 timeout
84 bytes from 192.168.20.110 icmp_seq=2 ttl=63 time=16.984 ms
84 bytes from 192.168.20.110 icmp_seq=3 ttl=63 time=16.037 ms
84 bytes from 192.168.20.110 icmp_seq=4 ttl=63 time=16.182 ms
84 bytes from 192.168.20.110 icmp_seq=5 ttl=63 time=16.073 ms
```

最初の1回目は arp テーブルの更新を行なっているために失敗している。それ以降は成功している事が確認できた。同様に PC2 から PC1, PC3 への ping も通ることが確認できる。そして今まで通り同じ VLAN の PC3 -> PC1 への ping も通っている事が確認できるはず。

PC3 で traceroute をしてみるとデフォルトゲートウェイを通って PC2 へ ping を送れてる事が確認できる。

```
PC3> trace 192.168.10.100
trace to 192.168.10.100, 8 hops max, press Ctrl+C to stop
 1   *192.168.10.100   0.178 ms (ICMP type:3, code:3, Destination port unreachable)

PC3> trace 192.168.20.110
trace to 192.168.20.110, 8 hops max, press Ctrl+C to stop
 1   192.168.10.12   9.700 ms  11.239 ms  10.001 ms
 2   *192.168.20.110   42.924 ms (ICMP type:3, code:3, Destination port unreachable)
```

これで今回の実験は終わり。

