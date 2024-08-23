---
title: L2 スイッチとルーターを組み合わせて Router on a stick を構築する
pubDatetime: 2024-08-22T23:44:07.000+09:00
featured: false
tags:
  - network
  - gns3
description: GNS3 上で L2 スイッチとルーターを組み合わせて Router on a stick を構築した備忘録です。
---

以前「[異なるポート VLAN 間の通信を GNS3 で実験する](https://blog.codehex.dev/posts/gns3_l3_port_vlan/)」にて L3 スイッチを使って異なる VLAN 間の通信を実験した。

今回はタイトルの通り、GNS3 上で L2 スイッチとルーターを組み合わせて Router on a stick を構築してみた。

[Router on a stick](https://en.wikipedia.org/wiki/Router_on_a_stick) とは L2 スイッチにつながっている異なる VLAN 間の通信を実現したい際に利用される構成である。現在ではルーティング機能を搭載している L3 スイッチ一つで VLAN を構成することもできるし、VLAN 間のルーティングも可能である。

![](https://storage.googleapis.com/zenn-user-upload/84d28d3eea3f-20240822.png)

Router on a stick の面白い点として、L2 スイッチとルーターの持つ機能をうまく融合しているところである。

- L2 スイッチでは VLAN を設定することができるが、IP アドレスを設定できない
- ルーターは IP アドレスを設定できるが、VLAN を設定することができない
- VLAN は trunk mode で利用すると1つのインターフェースで複数の VLAN と通信できる
- ルーターもサブインターフェースを複数作成でき、それぞれに IP アドレスを割り当てることができる
- サブインターフェースにも VLAN を設定することができる

Router on a stick はこれらの特性をうまく利用して、異なる VLAN 間の通信を実現している。

異なるネットワーク間で通信するにはデフォルトゲートウェイとなる IP アドレスを設定する必要がある。Router on a stick では、ルーターのサブインターフェースに IP アドレスを設定し、それをデフォルトゲートウェイとして利用する。

## L2 スイッチの設定

VLAN を作成する。ここでは VLAN 10 と VLAN 20 を作成する。

```
Switch1#show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Et0/0, Et0/1, Et0/2, Et0/3
                                                Et1/0, Et1/1, Et1/2, Et1/3
                                                Et2/0, Et2/1, Et2/2, Et2/3
                                                Et3/0, Et3/1, Et3/2, Et3/3
10   VLAN0010                         active
20   VLAN0020                         active
1002 fddi-default                     act/unsup
1003 token-ring-default               act/unsup
1004 fddinet-default                  act/unsup
1005 trnet-default                    act/unsup
Switch1(config)#vlan 10,20
Switch1(config-vlan)#end
```

インターフェースの設定を行う。VLAN 10 を Et1/0 に、VLAN 20 を Et1/1 にポート VLAN として割り当てる。

```
Switch1#conf t
Switch1(config)#int et1/0
Switch1(config-if)#switchport mode access
Switch1(config-if)#switchport access vlan 10
Switch1(config-if)#exit
Switch1(config)#int et1/1
Switch1(config-if)#switchport mode access
Switch1(config-if)#switchport access vlan 20
Switch1(config-if)#exit
```

ルーターと繋げている Et0/0 では trunk VLAN を有効にしていく。

```
Switch1(config)#int et0/0
Switch1(config-if)#switchport mode trunk
Command rejected: An interface whose trunk encapsulation is "Auto" can not be configured to "trunk" mode.
```

ここでリジェクトされてしまったが、これはフレームに追加する VLAN の形式をどうするか設定してないからである。（カプセル化形式）

ここでは `dot1q` を利用する。

```
Switch1(config-if)#switchport trunk encapsulation dot1q
Switch1(config-if)#switchport mode trunk
Switch1(config-if)#exit
Switch1(config)#end
Switch1#show int status

Port         Name               Status       Vlan       Duplex  Speed Type
Et0/0                           connected    trunk        full   auto 10/100/1000BaseTX
Et0/1                           connected    1            full   auto 10/100/1000BaseTX
Et0/2                           connected    1            full   auto 10/100/1000BaseTX
Et0/3                           connected    1            full   auto 10/100/1000BaseTX
Et1/0                           connected    10           full   auto 10/100/1000BaseTX
Et1/1                           connected    20           full   auto 10/100/1000BaseTX
...
```

## ルーターの設定

ルーターの設定を行う。ここでは VLAN 10 と VLAN 20 に IP アドレスを割り当てる。

まずはインターフェースを有効にし、その後にサブインターフェースを作成しながら IP アドレスと VLAN を設定する。

```
R1#conf t
R1(config)#int g0/0
R1(config-if)#no shutdown
R1(config-if)#end
R1(config)#int g0/0.10
R1(config-subif)#encapsulation dot1Q 10
R1(config-subif)#ip address 192.168.10.1 255.255.255.0
R1(config-subif)#exit
R1(config)#int g0/0.20
R1(config-subif)#encapsulation dot1Q 20
R1(config-subif)#ip address 192.168.20.1 255.255.255.0
R1(config-subif)#exit
R1(config)#end
```

これで Router on a stick の構築が完了した。`g0/0.10` インターフェースに割り当てた `192.168.10.1` が VLAN 10 のデフォルトゲートウェイとなる。そして `g0/0.20` インターフェースに割り当てた `192.168.20.1` が VLAN 20 のデフォルトゲートウェイとなる。

## テスト

PC1 と PC2 それぞれに IP アドレスと、ルーターで設定したデフォルトゲートウェイの IP を設定する。

まずは PC1 に IP アドレスを設定する。

```
PC1> ip 192.168.10.10/24 192.168.10.1
Checking for duplicate address...
PC1 : 192.168.10.10 255.255.255.0 gateway 192.168.10.1

PC1> show ip

NAME        : PC1[1]
IP/MASK     : 192.168.10.10/24
GATEWAY     : 192.168.10.1
DNS         :
MAC         : 00:50:79:66:68:00
LPORT       : 20008
RHOST:PORT  : 127.0.0.1:20009
MTU         : 1500
```

次に PC2 に IP アドレスを設定する。

```
PC2> ip 192.168.20.10/24 192.168.20.1
Checking for duplicate address...
PC2 : 192.168.20.10 255.255.255.0 gateway 192.168.20.1

PC2> show ip

NAME        : PC2[1]
IP/MASK     : 192.168.20.10/24
GATEWAY     : 192.168.20.1
DNS         :
MAC         : 00:50:79:66:68:01
LPORT       : 20010
RHOST:PORT  : 127.0.0.1:20011
MTU         : 1500
```

では、PC1 から PC2 に ping を送ってみる。

```
PC1> ping 192.168.20.10

84 bytes from 192.168.20.10 icmp_seq=1 ttl=63 time=108.140 ms
84 bytes from 192.168.20.10 icmp_seq=2 ttl=63 time=46.229 ms
84 bytes from 192.168.20.10 icmp_seq=3 ttl=63 time=45.977 ms
84 bytes from 192.168.20.10 icmp_seq=4 ttl=63 time=75.378 ms
84 bytes from 192.168.20.10 icmp_seq=5 ttl=63 time=33.457 ms
```

PC2 から PC1 にも ping を送ってみる。

```
PC2> ping 192.168.10.10

84 bytes from 192.168.10.10 icmp_seq=1 ttl=63 time=24.263 ms
84 bytes from 192.168.10.10 icmp_seq=2 ttl=63 time=33.193 ms
84 bytes from 192.168.10.10 icmp_seq=3 ttl=63 time=23.308 ms
84 bytes from 192.168.10.10 icmp_seq=4 ttl=63 time=23.657 ms
84 bytes from 192.168.10.10 icmp_seq=5 ttl=63 time=25.389 ms
```

通信ができていることが確認できた。PC1 で `traceroute` を確認してみるとちゃんとルーターを経由していることがわかる。

```
PC1> trace 192.168.20.10
trace to 192.168.20.10, 8 hops max, press Ctrl+C to stop
 1   192.168.10.1   94.300 ms  42.397 ms  30.329 ms
 2   *192.168.20.10   66.068 ms (ICMP type:3, code:3, Destination port unreachable)
```

## まとめ

Router on a stick は L2 スイッチとルーターを組み合わせて VLAN 間の通信を実現する構成である。L2 スイッチとルーターの特性をうまく利用して、異なる VLAN 間の通信を実現している。

この記事では GNS3 上で Router on a stick を構築し、PC1 と PC2 で通信ができることを確認した。
