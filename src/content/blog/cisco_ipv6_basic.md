---
title: Cisco の IPv6 ルータの基本的な設定
pubDatetime: 2024-08-21T00:37:31.000+09:00
featured: false
draft: false
tags:
  - network
  - gns3
description: GNS3 を使って Cisco の IPv6 ルータを設定した。リンクローカルユニキャストアドレスとグローバルユニキャストアドレスの設定方法、マルチキャストアドレスの確認方法、ping を使った疎通確認方法を説明した。
---

我らがまさる先生が公開している動画「[【11章 IPv6】基本的な設定に挑戦](https://youtu.be/DCbM-jcDkvk?si=ibNybF1zGsOY30RL)」を見ながら、パケットトレーサーではなく GNS3 を使って Cisco の IPv6 ルータを設定する。

画像のような2つのルーターで構成されたシンプルなトポロジを作成し、IPv6 ルータを設定する。

![](https://storage.googleapis.com/zenn-user-upload/4b0aa9f2c93b-20240821.png)

ここで実験したいことは、RT1 では IPv6 アドレスを手動で設定し、RT2 では IPv6 アドレスを自動で設定することである。自動で設定するのに SLAAC が使われることを想定している。

## R1の設定

config モードに入って IPv6 によるルーティングを有効にする。デフォルトでは無効になっている。

```
R1#conf t
R1(config)#ipv6 unicast-routing
R1(config)#^Z
R1#
```

interface gigabitEthernet 0/0 へ IPv6 アドレスを設定する。リンクローカルユニキャストアドレスとして `fe80::1` を設定し、グローバルユニキャストアドレスとして `2001:1::1/64` を設定する。

```
R1#conf t
R1(config)#int gi0/0
R1(config-if)#ipv6 address fe80::1 link-local
R1(config-if)#ipv6 address 2001:1::1/64
R1(config-if)#no shutdown
R1(config-if)#^Z
R1#
```

`show ipv6 int gi0/0` コマンドを使って設定を確認する。

```
R1#show ipv6 int gi0/0
GigabitEthernet0/0 is up, line protocol is up
  IPv6 is enabled, link-local address is FE80::1
  No Virtual link-local address(es):
  Global unicast address(es):
    2001:1::1, subnet is 2001:1::/64
  Joined group address(es):
    FF02::1
    FF02::2
    FF02::1:FF00:1
  MTU is 1500 bytes
  ICMP error messages limited to one every 100 milliseconds
  ICMP redirects are enabled
  ICMP unreachables are sent
  ND DAD is enabled, number of DAD attempts: 1
  ND reachable time is 30000 milliseconds (using 15892)
  ND advertised reachable time is 0 (unspecified)
  ND advertised retransmit interval is 0 (unspecified)
  ND router advertisements are sent every 200 seconds
  ND router advertisements live for 1800 seconds
  ND advertised default router preference is Medium
  Hosts use stateless autoconfig for addresses.
```

以上より、リンクローカルユニキャストアドレスが `FE80::1` で、グローバルユニキャストアドレスが `2001:1::1/64` として設定できたことが確認できた。

## R2の設定

R1と比較して、R2では自動設定を行う。R2 には IPv6 アドレスを手動で設定する必要はない。代わりに自動設定を有効にする。

```
R2#conf t
R2(config)#int gi0/0
R2(config-if)#ipv6 address autoconfig
R2(config-if)#^Z
R2#
```

動画では、この段階で R2 の IPv6 の設定を確認すると IPv6 アドレスが割り振られていたが以下のような結果になっており、IPv6 アドレスが割り振られていないなかった。

```
R2#show ipv6 int gi0/0
GigabitEthernet0/0 is administratively down, line protocol is down
  IPv6 is tentative, link-local address is FE80::C802:6FF:FEB6:8 [TEN]
  No Virtual link-local address(es):
  Stateless address autoconfig enabled
  No global unicast address is configured
  Joined group address(es):
    FF02::1
  MTU is 1500 bytes
  ICMP error messages limited to one every 100 milliseconds
  ICMP redirects are enabled
  ICMP unreachables are sent
  ND DAD is enabled, number of DAD attempts: 1
  ND reachable time is 30000 milliseconds (using 40609)
```

結果を眺めてみると、`GigabitEthernet0/0 is administratively down, line protocol is down` とあるので、インターフェースが有効化されていないことが原因であると考えられた。R1 と同様にインターフェースを有効化する。

```
R2#conf t
Enter configuration commands, one per line.  End with CNTL/Z.
R2(config)#int gi0/0
R2(config-if)#no shutdown
R2(config-if)#^Z
R2#
```

ここで改めて IPv6 の設定を確認すると、IPv6 アドレスが割り振られていた。

```
R2#show ipv6 int gi0/0
GigabitEthernet0/0 is up, line protocol is up
  IPv6 is enabled, link-local address is FE80::C802:6FF:FEB6:8
  No Virtual link-local address(es):
  Stateless address autoconfig enabled
  Global unicast address(es):
    2001:1::C802:6FF:FEB6:8, subnet is 2001:1::/64 [EUI/CAL/PRE]
      valid lifetime 2591995 preferred lifetime 604795
  Joined group address(es):
    FF02::1
    FF02::1:FFB6:8
  MTU is 1500 bytes
  ICMP error messages limited to one every 100 milliseconds
  ICMP redirects are enabled
  ICMP unreachables are sent
  ND DAD is enabled, number of DAD attempts: 1
  ND reachable time is 30000 milliseconds (using 40609)
  Default router is FE80::1 on GigabitEthernet0/0
```

リンクローカルユニキャストアドレスが `FE80::C802:6FF:FEB6:8` で、グローバルユニキャストアドレスが `2001:1::C802:6FF:FEB6:8` であることが確認できる。

## show コマンドを使った結果

R1 の設定で確認した `show ipv6 int gi0/0` コマンドの結果の一部を以下に示す。

```
Joined group address(es):
    FF02::1
    FF02::2
    FF02::1:FF00:1
```

この部分には参加しているマルチキャストアドレスの情報が記載されている。それぞれについて簡潔に書くと:

- `FF02::1`: すべてのノード
- `FF02::2`: すべてのルータ
- `FF02::1:FF00:1`: 要請ノードマルチキャストアドレス
  - このノードの IPv6 アドレスを知りたいノード

R2 では以下のような結果が得られた。

```
Joined group address(es):
    FF02::1
    FF02::1:FFB6:8
```

R1 と異なり、全てのルータに参加しているマルチキャストアドレス `FF02::2` が含まれていない。ここでもう一度 config もーどに入って `ipv6 unicast-routing` を有効にしてみる。

```
R2#conf t
Enter configuration commands, one per line.  End with CNTL/Z.
R2(config)#ipv6 unicast-routing
R2(config)#^Z
R2#show ipv6 int gi0/0
*Aug 20 16:06:46.427: %SYS-5-CONFIG_I: Configured from console by console
R2#show ipv6 int gi0/0
GigabitEthernet0/0 is up, line protocol is up
  IPv6 is enabled, link-local address is FE80::C802:6FF:FEB6:8
  No Virtual link-local address(es):
  Stateless address autoconfig enabled
  Global unicast address(es):
    2001:1::C802:6FF:FEB6:8, subnet is 2001:1::/64 [EUI/CAL/PRE]
      valid lifetime 2591885 preferred lifetime 604685
  Joined group address(es):
    FF02::1
    FF02::2
    FF02::1:FFB6:8
  MTU is 1500 bytes
  ICMP error messages limited to one every 100 milliseconds
  ICMP redirects are enabled
  ICMP unreachables are sent
  ND DAD is enabled, number of DAD attempts: 1
  ND reachable time is 30000 milliseconds (using 40609)
  ND advertised reachable time is 0 (unspecified)
  ND advertised retransmit interval is 0 (unspecified)
  ND router advertisements are sent every 200 seconds
  ND router advertisements live for 1800 seconds
  ND advertised default router preference is Medium
  Hosts use stateless autoconfig for addresses.
```

以上の結果より、`FF02::2` が含まれるようになったことが確認できた。また、インターフェースの MAC アドレスも確認してみると、リンクローカルユニキャストアドレスが MAC アドレスから EUI-64 で生成されていることがわかる。(`FF:FE` が挿入されている)

```
R2#show int gi0/0 | include address
  Hardware is i82543 (Livengood), address is ca02.06b6.0008 (bia ca02.06b6.0008)
```

## 疎通の確認

R2 から R1 に ping を送信してみる。リンクローカルユニキャストアドレスを使って ping を送信しようとすると `Output Interface:` と表示され、入力待機状態になる。これはリンクローカルユニキャストアドレスがリンク単位で有効なアドレスなため、どのインターフェースから出力するか求められる。

```
R2#ping ipv6 FE80::1
Output Interface: GigabitEthernet0/0
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to FE80::1, timeout is 2 seconds:
Packet sent with a source address of FE80::C802:6FF:FEB6:8
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 24/37/48 ms
```

今度はグローバルユニキャストアドレスを使って ping を送信してみる。ここではインターフェースを指定する必要はない。

```
R2#ping ipv6 2001:1::1

Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 2001:1::1, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 24/43/120 ms
```

リンクローカルユニキャストアドレスとグローバルユニキャストアドレスの両方で ping が通ることが確認できた。

## まとめ

GNS3 を使って Cisco の IPv6 ルータを設定する手順を説明した。

R1 では IPv6 アドレスを手動で設定し、R2 では自動設定を行った。また、リンクローカルユニキャストアドレスとグローバルユニキャストアドレスの設定方法、マルチキャストアドレスの確認方法、ping を使った疎通確認方法を説明した。

以上の手順を実行することで、IPv6 ルータの設定を理解することができた。

これらの手順を行った際にパケットキャプチャをしていたので、そのリンクを貼っておく。

[ipv6.pcapng](https://drive.google.com/file/d/1Jst8S5KqAN7GEApxH7xWZW3I8his8nYZ/view?usp=drive_link)
