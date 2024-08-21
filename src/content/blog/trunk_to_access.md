---
title: Trunk to Access – Will It Work?
pubDatetime: 2024-08-21T22:03:31.000+09:00
featured: false
draft: false
tags:
  - network
  - translated
description: Trunk to Access – Will It Work? の日本語訳です。
---

この記事は「[Trunk to Access – Will It Work?](https://lostintransit.se/2023/12/09/trunk-to-access-will-it-work/)」の日本語訳です。

著者の [Daniel Dib (@danieldibswe)](https://twitter.com/danieldibswe) さんに許可をいただいて翻訳・掲載しています。彼のブログは非常に学びのあるネットワークに関する記事が多いので是非訪れてみてください。

===

最近、2台のCisco Catalystスイッチを接続するという質問を[Twitter](https://twitter.com/danieldibswe/status/1733029273156432236)に投稿しました。1台のスイッチはすでに起動しており、以下の設定があります：

```plaintext
interface GigabitEthernet0/0
 description SW02
 switchport mode trunk
 switchport trunk allowed vlan 1,10,20,30
 switchport nonegotiate
```

もう1台のスイッチはGi1/0/48に接続され、電源を入れたばかりで、デフォルト設定のまま起動しています。このスイッチをPlug and Play（PNP）を使用してCatalyst Centerにオンボードすることを目的としています。

回答を基に、多くの人がこのシナリオが機能するかどうか、またその理由を説明できなかったことがわかりました。このシナリオにはいくつかの興味深い詳細があります。私自身、このシナリオに遭遇する前は機能するかもしれないと思っていましたが、実際にはどうでしょうか。まず、現在の時点でスイッチSW01とSW02についてわかっていることを整理してみましょう。

SW01については：

- ポートがトランクモードに設定されている
- トランクで許可されているVLANは1,10,20,30
- DTP（Dynamic Trunking Protocol）が無効化されている
- ネイティブVLANは1

SW02については：

- すべてのポートが有効な状態で起動する
- これらのポートはVLAN 1に所属する
- ポートではDTPが有効化されている

この設定の下では、SW02のポートはVLAN 1のアクセスポートとして起動し、SW01のポートはVLAN 1のネイティブVLANを持つトランクであるため、理論的には機能するはずです。つまり、SW02はタグなしフレームをSW01に送信し、SW01はそれをVLAN 1内で転送します。逆にSW01もタグなしフレームをVLAN 1に送り、双方向のフレームの流れが生じます。理論的には正しいですが、実際にはそうなりません。なぜでしょうか？見ていきましょう。

```plaintext
SW02#show int gi0/0 switchport 
Name: Gi0/0
Switchport: Enabled
Administrative Mode: dynamic auto
Operational Mode: static access
Administrative Trunking Encapsulation: negotiate
Operational Trunking Encapsulation: native
Negotiation of Trunking: On
Access Mode VLAN: 1 (default)
Trunking Native Mode VLAN: 1 (default)
Administrative Native VLAN tagging: enabled
Voice VLAN: none
Administrative private-vlan host-association: none 
Administrative private-vlan mapping: none 
Administrative private-vlan trunk native VLAN: none
Administrative private-vlan trunk Native VLAN tagging: enabled
Administrative private-vlan trunk encapsulation: dot1q
Administrative private-vlan trunk normal VLANs: none
Administrative private-vlan trunk associations: none
Administrative private-vlan trunk mappings: none
Operational private-vlan: none
Trunking VLANs Enabled: ALL
Pruning VLANs Enabled: 2-1001
Capture Mode Disabled
Capture VLANs Allowed: ALL
Protected: false
Appliance trust: none
```

SW02のポートがデフォルトで `dynamic auto` に設定されており、他方ではDTPが無効化されているため、ポートはVLAN 1のアクセスポートとして起動します。これを別のコマンドで確認してみましょう：

```plaintext
Protected: false
Appliance trust: none
SW02#show int gi0/0 trunk
Port        Mode             Encapsulation  Status        Native vlan
Gi0/0       auto             negotiate      not-trunking  1
Port        Vlans allowed on trunk
Gi0/0       1
Port        Vlans allowed and active in management domain
Gi0/0       1
Port        Vlans in spanning tree forwarding state and not pruned
Gi0/0       1
```

これを見ると、一見すると機能しそうですが、コンソールには以下のメッセージが記録されています：

```plaintext
*Dec  9 07:10:32.320: %SPANTREE-7-RECV_1Q_NON_TRUNK: Received 802.1Q BPDU on non trunk GigabitEthernet0/0 VLAN1.
*Dec  9 07:10:32.320: %SPANTREE-7-BLOCK_PORT_TYPE: Blocking GigabitEthernet0/0 on VLAN0001. Inconsistent port type.
```

これはどういう意味でしょうか？これは、SW01がタグ付けされたSTP BPDUをSW02に送信したことを意味します。メッセージの「inconsistent port type」は何が起こっているかを説明しています。トランクがアクセスポートに接続されています。なぜこれが起こっているのかを理解するためには、Catalystスイッチが生成するBPDUの種類に戻る必要があります。この件についてはCisco TACが説明している[PVIDの不一致のトラブルシューティング](https://www.cisco.com/c/en/us/support/docs/lan-switching/spanning-tree-protocol/24063-pvid-inconsistency-24063.html)をご覧ください。もしネイティブVLANが1の場合、Catalystスイッチは以下のBPDUを生成します：

- VLAN 1のタグなしBPDUをIEEE STPのMACアドレス0180.c200.0000に送信
- VLAN 1のタグなしBPDUをPVST+のMACアドレス0100.0ccc.cccdに送信
- 非VLAN 1のタグ付きBPDUをPVST+のMACアドレス0100.0ccc.cccdに送信

なぜCatalystスイッチはVLAN1や現在のネイティブVLANに対して2つのBPDUを生成するのですか？これは、CiscoがPer VLAN Spanning Treeを実行している一方で、VLANごとに動作しないIEEE標準のSTPとも互換性があるためです。

では、ポートの不一致はどのように検出されるのでしょうか？これは、CiscoのBPDUにBPDUの発信元VLANを含むフィールドがあるためです。

![](https://lostintransit.se/wp-content/uploads/2023/12/Cisco_BPDU_1.png)

フレームがタグなしで送信されたとしても、BPDU内の発信元VLANはこれがトランクであることを示しています。一方で、SW02はアクセスポートであるため、IEEE STPのMACアドレスにのみBPDUを送信しています：

![](https://lostintransit.se/wp-content/uploads/2023/12/SW02_BPDU_1.png)

SW02は次のように不整合なポートを持っていることを確認できます：

```plaintext
SW02#show span inconsistentports 
Name                 Interface                Inconsistency
-------------------- ------------------------ ------------------
VLAN0001             GigabitEthernet0/0       Port Type Inconsistent
Number of inconsistent ports (segments) in the system : 1
```

ポートがまだアップしていることにも注意が必要です：

```plaintext
SW02#show int gi0/0
GigabitEthernet0/0 is up, line protocol is up (connected) 
  Hardware is iGbE, address is 5254.0002.2f7d (bia 5254.0002.2f7d)
  MTU 1500 bytes, BW 1000000 Kbit/sec, DLY 10 usec, 
     reliability 255/255, txload 1/255, rxload 1/255
  Encapsulation ARPA, loopback not set
  Keepalive set (10 sec)
  Auto Duplex, Auto Speed, link type is auto, media type is RJ45
  output flow-control is unsupported, input flow-control is unsupported
  ARP type: ARPA, ARP Timeout 04:00:00
  Last input 00:00:00, output 00:00:00, output hang never
  Last clearing of "show interface" counters never
  Input queue: 3/75/0/0 (size/max/drops/flushes); Total output drops: 0
  Queueing strategy: fifo
  Output queue: 0/0 (size/max)
  5 minute input rate 1000 bits/sec, 2 packets/sec
  5 minute output rate 0 bits/sec, 0 packets/sec
     733 packets input, 52654 bytes, 0 no buffer
     Received 729 broadcasts (729 multicasts)
     0 runts, 0 giants, 0 throttles 
     0 input errors, 0 CRC, 0 frame, 0 overrun, 0 ignored
     0 watchdog, 729 multicast, 0 pause input
     396 packets output, 32042 bytes, 0 underruns
     0 output errors, 0 collisions, 3 interface resets
     0 unknown protocol drops
     0 babbles, 0 late collision, 0 deferred
     0 lost carrier, 0 no carrier, 0 pause output
     0 output buffer failures, 0 output buffers swapped out
```

STPの詳細を見ると、以下のように確認できます：

```plaintext
SW02#show span int gi0/0
Vlan                Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
VLAN0001            Desg BKN*4         128.1    P2p *TYPE_Inc 
SW02#show span int gi0/0 det
 Port 1 (GigabitEthernet0/0) of VLAN0001 is broken  (Port Type Inconsistent)
   Port path cost 4, Port priority 128, Port Identifier 128.1.
   Designated root has priority 32769, address 5254.0002.2f7d
   Designated bridge has priority 32769, address 5254.0002.2f7d
   Designated port id is 128.1, designated path cost 0
   Timers: message age 0, forward delay 13, hold 0
   Number of transitions to forwarding state: 0
   Link type is point-to-point by default
   BPDU: sent 71, received 71
```

BPDUsの送受信の数に注目してください。安定したトポロジでは、リンクのどちらがデザインされた側であるかに応じて、送信または受信されるBPDUsの数が多くなります。このシナリオでは、不整合のためにトポロジが安定していないため、両側が自分たちがデザインされた側だと思い続けてBPDUsを送信し続けています。

したがってデータプレーンの観点からは、ネイティブVLAN 1を持つトランクがVLAN 1のアクセスポートに接続することが可能である一方、制御プレーンがポートの不整合を防いでいます。不整合は一般的に何かが誤って構成されていることを意味するので、良くないことです。

以前、トランクには複数のVLANがあったことを思い出してください。もしVLAN 1のみを許可した場合、どうなるでしょうか？

```plaintext
interface GigabitEthernet0/0
 switchport trunk allowed vlan 1
 switchport mode trunk
 switchport nonegotiate
```

結果は同じです。SW01はVLAN情報を含むBPDUsを発信しています。以下がSW02で記録された内容です：

```plaintext
*Dec  9 07:35:43.405: %SPANTREE-7-RECV_1Q_NON_TRUNK: Received 802.1Q BPDU on non trunk GigabitEthernet0/0 VLAN1.
*Dec  9 07:35:43.406: %SPANTREE-7-BLOCK_PORT_TYPE: Blocking GigabitEthernet0/0 on VLAN0001. Inconsistent port type.
```

それでは安定したトポロジにどうやってするのでしょうか？SW01でDTPを有効にするのはどうでしょう？

```plaintext
SW01#conf t
Enter configuration commands, one per line.  End with CNTL/Z.
SW01(config)#int gi0/0
SW01(config-if)#no switchport nonegotiate
```

SW02のポートはどうなるでしょうか？

```plaintext
SW02#show int gi0/0 switchport 
Name: Gi0/0
Switchport: Enabled
Administrative Mode: dynamic auto
Operational Mode: trunk
Administrative Trunking Encapsulation: negotiate
Operational Trunking Encapsulation: dot1q
Negotiation of Trunking: On
Access Mode VLAN: 1 (default)
Trunking Native Mode VLAN: 1 (default)
Administrative Native VLAN tagging: enabled
Voice VLAN: none
Administrative private-vlan host-association: none 
Administrative private-vlan mapping: none 
Administrative private-vlan trunk native VLAN: none
Administrative private-vlan trunk Native VLAN tagging: enabled
Administrative private-vlan trunk encapsulation: dot1q
Administrative private-vlan trunk normal VLANs: none
Administrative private-vlan trunk associations: none
Administrative private-vlan trunk mappings: none
Operational private-vlan: none
Trunking VLANs Enabled: ALL
Pruning VLANs Enabled: 2-1001
Capture Mode Disabled
Capture VLANs Allowed: ALL
Protected: false
Appliance trust: none
```

それがトランクポートに変わりました！一方が `dynamic auto` で、もう一方がトランクに設定されているため、SW02でトランクが形成されました。これにより不整合が解消されました：

```plaintext
SW02#show span inconsistentports 
Name                 Interface                Inconsistency
-------------------- ------------------------ ------------------
Number of inconsistent ports (segments) in the system : 0
```

これはSTPの出力を確認してもわかります：

```plaintext
SW02#show span int gi0/0
Vlan                Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
VLAN0001            Root FWD 4         128.1    P2p 
SW02#show span int gi0/0 det
 Port 1 (GigabitEthernet0/0) of VLAN0001 is root forwarding 
   Port path cost 4, Port priority 128, Port Identifier 128.1.
   Designated root has priority 1, address 5254.001a.aa98
   Designated bridge has priority 1, address 5254.001a.aa98
   Designated port id is 128.1, designated path cost 0
   Timers: message age 16, forward delay 0, hold 0
   Number of transitions to forwarding state: 1
   Link type is point-to-point by default
   BPDU: sent 4, received 49
```

素晴らしい！問題は解決しました！さて、SW01でネイティブVLANを1以外に変更したらどうなるでしょうか？

```plaintext
SW01(config)#int gi0/0
SW01(config-if)#switchport trunk native vlan 10
SW01(config-if)#
```

SW01のログには次のようなメッセージが表示されます：

```plaintext
*Dec  9 07:21:24.939: %SPANTREE-2-RECV_PVID_ERR: Received BPDU with inconsistent peer vlan id 1 on GigabitEthernet0/0 VLAN10.
*Dec  9 07:21:24.939: %SPANTREE-2-BLOCK_PVID_PEER: Blocking GigabitEthernet0/0 on VLAN0001. Inconsistent peer vlan.
*Dec  9 07:21:24.940: %SPANTREE-2-BLOCK_PVID_LOCAL: Blocking GigabitEthernet0/0 on VLAN0010. Inconsistent local vlan.
*Dec  9 07:22:14.563: %CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on GigabitEthernet0/0 (10), with SW02 GigabitEthernet0/0 (1).
```

ネイティブVLANの不一致が発生しています！CDPが不一致を報告しますが、不一致はVLAN 10でBPDUを受信し、元のVLANが1であることから発見されました：

![](https://lostintransit.se/wp-content/uploads/2023/12/SW02_BPDU_2.png)


SW01はVLAN1とVLAN10を矛盾しているのでブロックしています：

```plaintext
SW01#show span inconsistentports 
Name                 Interface                Inconsistency
-------------------- ------------------------ ------------------
VLAN0001             GigabitEthernet0/0       Port VLAN ID Mismatch
VLAN0010             GigabitEthernet0/0       Port VLAN ID Mismatch
Number of inconsistent ports (segments) in the system : 2
```

ただし、他のVLANは転送が許可されています：

```plaintext
SW01#show span int gi0/0
Vlan                Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
VLAN0001            Desg BKN*4         128.1    P2p *PVID_Inc 
VLAN0010            Desg BKN*4         128.1    P2p *PVID_Inc 
VLAN0020            Desg FWD 4         128.1    P2p 
VLAN0030            Desg FWD 4         128.1    P2p 
SW01#show span int gi0/0 det
 Port 1 (GigabitEthernet0/0) of VLAN0001 is broken  (Port VLAN ID Mismatch)
   Port path cost 4, Port priority 128, Port Identifier 128.1.
   Designated root has priority 1, address 5254.001a.aa98
   Designated bridge has priority 1, address 5254.001a.aa98
   Designated port id is 128.1, designated path cost 0
   Timers: message age 0, forward delay 14, hold 0
   Number of transitions to forwarding state: 1
   Link type is point-to-point by default
   BPDU: sent 219, received 110
 Port 1 (GigabitEthernet0/0) of VLAN0010 is broken  (Port VLAN ID Mismatch)
   Port path cost 4, Port priority 128, Port Identifier 128.1.
   Designated root has priority 10, address 5254.001a.aa98
   Designated bridge has priority 10, address 5254.001a.aa98
   Designated port id is 128.1, designated path cost 0
   Timers: message age 0, forward delay 14, hold 0
   Number of transitions to forwarding state: 1
   Link type is point-to-point by default
   BPDU: sent 219, received 0
 Port 1 (GigabitEthernet0/0) of VLAN0020 is designated forwarding 
   Port path cost 4, Port priority 128, Port Identifier 128.1.
   Designated root has priority 20, address 5254.001a.aa98
   Designated bridge has priority 20, address 5254.001a.aa98
   Designated port id is 128.1, designated path cost 0
   Timers: message age 0, forward delay 0, hold 0
   Number of transitions to forwarding state: 1
   Link type is point-to-point by default
   BPDU: sent 219, received 0
 Port 1 (GigabitEthernet0/0) of VLAN0030 is designated forwarding 
   Port path cost 4, Port priority 128, Port Identifier 128.1.
   Designated root has priority 30, address 5254.001a.aa98
   Designated bridge has priority 30, address 5254.001a.aa98
   Designated port id is 128.1, designated path cost 0
   Timers: message age 0, forward delay 0, hold 0
   Number of transitions to forwarding state: 1
   Link type is point-to-point by default
   BPDU: sent 219, received 0
```

同様に、SW02もブロックしています：

```plaintext
*Dec  9 07:21:24.266: %SPANTREE-2-RECV_PVID_ERR: Received BPDU with inconsistent peer vlan id 10 on GigabitEthernet0/0 VLAN1.
*Dec  9 07:21:24.268: %SPANTREE-2-BLOCK_PVID_LOCAL: Blocking GigabitEthernet0/0 on VLAN0001. Inconsistent local vlan.
*Dec  9 07:21:57.891: %CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on GigabitEthernet0/0 (1), with SW01 GigabitEthernet0/0 (10).
```

正しいネイティブVLANが設定されると、不整合は解消されます。SW01のログメッセージ：

```plaintext
*Dec  9 07:33:44.054: %SPANTREE-2-UNBLOCK_CONSIST_PORT: Unblocking GigabitEthernet0/0 on VLAN0001. Port consistency restored.
*Dec  9 07:33:44.055: %SPANTREE-2-UNBLOCK_CONSIST_PORT: Unblocking GigabitEthernet0/0 on VLAN0010. Port consistency restored.
```

SW02のログメッセージ：

```plaintext
*Dec  9 07:33:43.859: %SPANTREE-2-UNBLOCK_CONSIST_PORT: Unblocking GigabitEthernet0/0 on VLAN0001. Port consistency restored.
```

この投稿は詳細が多いですが、STPの概念と設定ミスの検出について理解するのに役立ったことを願います。学んだことは以下の通りです：

- Catalystスイッチは、すべてのポートをVLAN 1で起動し、DTPを有効にします。
- ポートはデフォルトで `dynamic auto` として設定され、もう一方がトランクである限り、トランクが形成されます。
- トランクがアクセスポートに接続されても、データプレーンの観点では機能するかもしれませんが、コントロールプレーンが設定ミスを検出します。
- CiscoスイッチはIEEEのMACアドレスとCiscoのMACアドレスの両方にBPDUを送信します。
- CiscoのBPDUには、元のVLANに関する情報が含まれています。
- CDPはネイティブVLANの設定ミスを報告しますが、実際に検出しているのはSTPです。

ご覧いただきありがとうございます！
