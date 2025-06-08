---
title: VLAN を構築し、インターネットへ接続する
pubDatetime: 2024-09-04T23:41:19.000+09:00
featured: false
draft: false
tags:
  - network
  - gns3
description: GNS3 上で L2 スイッチとルーターを使って2つのVLANを作成し、それぞれのエンドデバイスがインターネットに接続できるようにしました。
---

今更だが、私の GNS3 の環境は Apple Silicon で動かしている [OrbStack](https://orbstack.dev/) VM 上に構築している。[GNS3 on Apple Silicon](https://marcstech.blog/archives/gns3-apple-silicon/) に詳しい手順が書かれているので、参考にしてほしい。

今回は、GNS3 上で L2 スイッチとルーターを使って2つの VLAN を作成し、それぞれのエンドデバイスがインターネットに接続できるようにしました。以下の画像が今回構築したとトポロジーになる。

![](https://storage.googleapis.com/zenn-user-upload/39ee09060321-20240904.png)

PC1 を VLAN10 に、PC2 を VLAN20 に所属させる。

## スイッチ

スイッチの設定は以下のように行った。ここで VLAN の設定を行う。

```
Switch#show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Et0/0, Et0/1, Et0/2, Et0/3
                                                Et1/0, Et1/1, Et1/2, Et1/3
                                                Et2/0, Et2/1, Et2/2, Et2/3
                                                Et3/0, Et3/1, Et3/2, Et3/3
1002 fddi-default                     act/unsup
1003 token-ring-default               act/unsup
1004 fddinet-default                  act/unsup
1005 trnet-default                    act/unsup
Switch#conf t
Switch(config)#vlan 10
Switch(config-vlan)#name VLAN-10
Switch(config-vlan)#exit
Switch(config)#vlan 20
Switch(config-vlan)#name VLAN-20
Switch(config-vlan)#exit
Switch(config)#int e1/0
Switch(config-if)#switchport access vlan 10
Switch(config-if)#exit
Switch(config)#int e2/0
Switch(config-if)#switchport access vlan 20
Switch(config-if)#exit
Switch(config)#int e0/0
Switch(config-if)#switchport trunk encapsulation dot1q
Switch(config-if)#switchport mode trunk
Switch(config-if)#switchport trunk allowed vlan 10,20
Switch(config-if)#exit
Switch(config)#end
Switch#show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Et0/1, Et0/2, Et0/3, Et1/1
                                                Et1/2, Et1/3, Et2/1, Et2/2
                                                Et2/3, Et3/0, Et3/1, Et3/2
                                                Et3/3
10   VLAN-10                          active    Et1/0
20   VLAN-20                          active    Et2/0
1002 fddi-default                     act/unsup
1003 token-ring-default               act/unsup
1004 fddinet-default                  act/unsup
1005 trnet-default                    act/unsup
Switch#show int trunk

Port           Mode             Encapsulation  Status        Native vlan
Et0/0          on               802.1q         trunking      1

Port           Vlans allowed on trunk
Et0/0          1,10,20

Port           Vlans allowed and active in management domain
Et0/0          1,10,20

Port           Vlans in spanning tree forwarding state and not pruned
Et0/0          1,10,20
```

## ルーター

ルーターの設定は以下のように行った。ここで作成した VLAN をルーティングできるように設定し、インターネットに接続できるようにした。

インターネットへ接続するために GNS3 が公式ドキュメントの「[Connect GNS3 to the Internet (local server)](https://docs.gns3.com/docs/using-gns3/advanced/connect-gns3-internet/)」に従って Cloud を設定した。インターフェースは `virbr0` である。

![](https://storage.googleapis.com/zenn-user-upload/c8a6771887e1-20240905.png)

設定後 GNS3 を動かしている OrbStack VM へログインし、`ip a` コマンドでインターフェースの IP アドレスを確認する。

```
$ ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
...
4: virbr0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether 52:54:00:6c:f1:43 brd ff:ff:ff:ff:ff:ff
    inet 192.168.122.1/24 brd 192.168.122.255 scope global virbr0
       valid_lft forever preferred_lft forever
...
```

これより `192.168.122.1` が default gateway として設定できる IP であることがわかる。

```
R1#conf t
Enter configuration commands, one per line.  End with CNTL/Z.
R1(config)#int f0/0
R1(config-if)#no shutdow
R1(config-if)#no shutdown
R1(config-if)#exit
R1(config)#
*Sep  4 13:41:45.903: %LINK-3-UPDOWN: Interface FastEthernet0/0, changed state to up
*Sep  4 13:41:46.903: %LINEPROTO-5-UPDOWN: Line protocol on Interface FastEthernet0/0, changed state to up
R1(config)#int f0/0.10
R1(config-subif)#enc
R1(config-subif)#encapsulation do
R1(config-subif)#encapsulation dot1Q 10
R1(config-subif)#ip address 192.168.10.1 255.255.255.0
R1(config-subif)#exit
R1(config)#int f0/0.20
R1(config-subif)#en
R1(config-subif)#encapsulation do
R1(config-subif)#encapsulation dot1Q 20
R1(config-subif)#ip address 192.168.20.1 255.255.255.0
R1(config-subif)#end
R1#ping 1.1.1.1

Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 1.1.1.1, timeout is 2 seconds:
.....
Success rate is 0 percent (0/5)
R1#conf t
R1(config)#int g1/0
R1(config-if)#ip address 192.168.122.10 255.255.255.0
R1(config-if)#end
R1#ping 1.1.1.1

Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 1.1.1.1, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 88/97/120 ms
R1#show ip route
Codes: C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area
       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
       E1 - OSPF external type 1, E2 - OSPF external type 2
       i - IS-IS, su - IS-IS summary, L1 - IS-IS level-1, L2 - IS-IS level-2
       ia - IS-IS inter area, * - candidate default, U - per-user static route
       o - ODR, P - periodic downloaded static route

Gateway of last resort is 192.168.122.1 to network 0.0.0.0

C    192.168.122.0/24 is directly connected, GigabitEthernet1/0
C    192.168.10.0/24 is directly connected, FastEthernet0/0.10
C    192.168.20.0/24 is directly connected, FastEthernet0/0.20
S*   0.0.0.0/0 [1/0] via 192.168.122.1
```

Cloud1 と繋げている GigabitEthernet1/0 部分の IP アドレスを 192.168.122.10 として設定した。この時のサブネットマスクは OrbStack で確認した範囲に合わせている。

この時点でルーターからインターネットに接続できるようになっている。Cloudflare の 1.1.1.1 へ ping の痩身に成功しているが、以下の通り PC1 と PC2 はまだインターネットに接続できない。

```
PC1> ping 192.168.20.10 # PC2 への ping

84 bytes from 192.168.20.10 icmp_seq=1 ttl=63 time=86.242 ms
84 bytes from 192.168.20.10 icmp_seq=2 ttl=63 time=29.429 ms
84 bytes from 192.168.20.10 icmp_seq=3 ttl=63 time=17.276 ms
84 bytes from 192.168.20.10 icmp_seq=4 ttl=63 time=36.174 ms
84 bytes from 192.168.20.10 icmp_seq=5 ttl=63 time=15.770 ms

PC1> ping 192.168.122.10 # R1 の GigabitEthernet1/0 への ping

84 bytes from 192.168.122.10 icmp_seq=1 ttl=255 time=109.748 ms
84 bytes from 192.168.122.10 icmp_seq=2 ttl=255 time=22.078 ms
84 bytes from 192.168.122.10 icmp_seq=3 ttl=255 time=16.743 ms
84 bytes from 192.168.122.10 icmp_seq=4 ttl=255 time=27.376 ms
84 bytes from 192.168.122.10 icmp_seq=5 ttl=255 time=40.664 ms

PC1> ping 1.1.1.1 # Cloudflare の ping

1.1.1.1 icmp_seq=1 timeout
1.1.1.1 icmp_seq=2 timeout
1.1.1.1 icmp_seq=3 timeout
1.1.1.1 icmp_seq=4 timeout
1.1.1.1 icmp_seq=5 timeout

PC1> ping 192.168.122.1 # virbr0 の ping

192.168.122.1 icmp_seq=1 timeout
192.168.122.1 icmp_seq=2 timeout
192.168.122.1 icmp_seq=3 timeout
192.168.122.1 icmp_seq=4 timeout
192.168.122.1 icmp_seq=5 timeout

```

### NAT の設定

NAT の設定を行うことで、PC1 と PC2 がインターネットに接続できるようになる。

インターネットへの接続は GigabitEthernet1/0 で行っているため、そのインターフェースを `ip nat outside` として設定する。また、VLAN10 と VLAN20 はそれぞれ FastEthernet0/0.10 と FastEthernet0/0.20 で接続しているため、これらのインターフェースを `ip nat inside` として設定する。

`ip nat inside` でインターフェースが内部ネットワーク（通常はプライベートIPアドレス空間）に接続されていることを示し、`ip nat outside` でインターフェースが外部ネットワーク（通常はインターネットなどのパブリックネットワーク）に接続されていることを示す。

```
R1(config)#int g1/0
R1(config-if)#ip nat outside
R1(config-if)#exit
R1(config)#int fa0/0.10
R1(config-subif)#ip nat inside
R1(config-subif)#exit
R1(config)#int fa0/0.20
R1(config-subif)#ip nat inside
R1(config-subif)#end
R1(config)#ip nat inside source list 1 interface g1/0 overload
R1(config)#access-list 1 permit 192.168.10.0 0.0.0.255
R1(config)#access-list 1 permit 192.168.20.0 0.0.0.255
```

それぞれ設定した後 `ip nat inside source list 1 interface g1/0 overload` で NAT の設定を行う。これにより、VLAN10 と VLAN20 からの通信が GigabitEthernet1/0 へ送信される際に NAT が適用するようになる。このコマンドの対象は `access-list 1` である。

`access-list 1` は 192.168.10.0 と 192.168.20.0 のネットワーク範囲とのやりとりを許可するように設定している。

これで PC1 と PC2 がインターネットに接続できるようになる。

```
PC1> ping 1.1.1.1

84 bytes from 1.1.1.1 icmp_seq=1 ttl=50 time=120.196 ms
84 bytes from 1.1.1.1 icmp_seq=2 ttl=50 time=79.772 ms
84 bytes from 1.1.1.1 icmp_seq=3 ttl=50 time=51.237 ms
84 bytes from 1.1.1.1 icmp_seq=4 ttl=50 time=67.722 ms
84 bytes from 1.1.1.1 icmp_seq=5 ttl=50 time=84.699 ms
```
