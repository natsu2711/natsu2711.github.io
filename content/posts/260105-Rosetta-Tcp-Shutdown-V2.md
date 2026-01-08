---
title: "Rosetta Tcp Shutdown V2"
date: 2026-01-05
categories: ["AI"]
tags: ["Python"]
---


# TCP Socket关闭机制 - 罗塞塔石碑实验分析

**生成时间**: 2026-01-05
**目标系统**: TCP Socket双工关闭机制
**分析方法**: 罗塞塔石碑实验法

---

## 第一步：定层级

| 层级 | 名称 | 数据形态 | 为什么需要这层（问题驱动） | 可观测性 |
|------|------|----------|------------------------|----------|
| 层级1 | 应用层 | socket.close() / shutdown() | **痛点**：代码调用close()后，服务器发送的数据接收不到，不知道为什么。<br>**如果没有这层**：无法理解API层面的行为差异，close()和shutdown()看起来都是关闭。<br>**解决什么**：理解close()=完全关闭，shutdown()=半关闭的本质区别。 | ✅ 源代码可见 |
| 层级2 | 系统调用层 | close() / shutdown() syscall | **痛点**：Python的socket.close()到底调用了什么系统调用？为什么有时候会收到RST而不是FIN？<br>**如果没有这层**：无法追踪从Python API到内核的完整路径，不知道哪里出了问题。<br>**解决什么**：看到API→系统调用的映射，理解SO_LINGER等参数的作用时机。 | ✅ strace追踪 |
| 层级3 | TCP状态机 | ESTAB → CLOSE_WAIT → LAST_ACK → TIME_WAIT | **痛点**：ss命令显示大量CLOSE_WAIT连接堆积，占用文件描述符，不知道原因。<br>**如果没有这层**：无法理解连接状态的转换逻辑，不知道为什么会停在某个状态。<br>**解决什么**：理解CLOSE_WAIT=应用忘记close()，TIME_WAIT=主动关闭方等待2MSL。 | ✅ ss命令查看 |
| 层级4 | 网络传输层 | FIN/ACK/RST包 | **痛点**：程序莫名报错"Connection reset by peer"，不知道对端发生了什么。<br>**如果没有这层**：无法看到真正的网络数据包，不知道是FIN还是RST，无法定位问题。<br>**解决什么**：看到FIN=优雅关闭，RST=强制重置，定位是哪一方异常关闭。 | ✅ tcpdump抓包 |

**为什么要分层？**

每一层都是数据的一次"形态转换"：
```
应用API → 系统调用 → TCP状态 → 网络包
```

只有追踪形态变化，才能回答：
- close()和shutdown()有什么区别？
- 为什么会停在CLOSE_WAIT？
- 程序为什么会收到RST？

---

## 第二步：定关卡

### 关卡表格

| 关卡 | 数据转换对象 | 关键问题 | 主要观测工具 |
|------|-------------|---------|-------------|
| 关卡1 API选择 | close() → FIN包 | 完全关闭 vs 半关闭，为什么数据会丢失？ | strace |
| 关卡2 内核处理 | FIN → tcp_close() | SO_LINGER参数如何影响关闭行为？ | ftrace |
| 关卡3 状态转换 | ESTAB → FIN_WAIT_1 → FIN_WAIT_2 | 为什么会停在TIME_WAIT 60秒？ | ss命令 |
| 关卡4 网络传输 | FIN → ACK → FIN → ACK | 四次握手的顺序是什么？为什么需要2MSL？ | tcpdump |
| 关卡5 半关闭机制 | shutdown(SHUT_WR) → 可接收但不可发送 | 如何实现优雅关闭，确保数据完整接收？ | 应用代码 + 抓包 |

---

### 关卡因果链路（横向展示）

**正常关闭流程（使用shutdown）**：

```
应用层调用 shutdown(SHUT_WR) ━━━━━━━━━━━━━━━━━━━━━━━┓
                                                      ↓
                                               发送FIN，保留接收能力
                                                      ↓
                                               进入FIN_WAIT_1
                                                      ↓
                                               收到ACK？
        ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━┓
        ↓                                                            ↓
    收到ACK                                                    超时重传
        ↓                                                            ↓
  进入FIN_WAIT_2                                                 重试...
        ↓
  收到对端FIN？
        ↓
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━┓
↓                                                              ↓
收到FIN                                                        超时（2MSL）
↓                                                              ↓
发送ACK                                                    最终CLOSED
↓
进入TIME_WAIT
↓
等待60秒（防止延迟包干扰新连接）
↓
CLOSED
```

**异常关闭流程（使用close且有未发送数据）**：

```
应用层调用 close() ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
                                                          ↓
                                                发送缓冲区有数据？
              ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━┓
              ↓                                                        ↓
          是（有数据）                                           否（干净）
              ↓                                                        ↓
      发送RST（丢弃数据）                                    发送FIN（优雅）
              ↓                                                        ↓
      立即CLOSED                                            进入FIN_WAIT_1
```

**服务器端CLOSE_WAIT路径（常见泄漏）**：

```
收到客户端FIN ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
                                                          ↓
                                                   进入CLOSE_WAIT
                                               （等待应用层处理）
                                                          ↓
                                              应用层调用close？
  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┻━━━━━━┓
  ↓                                                              ↓
  是（调用close）                                             否（忘记close）
  ↓                                                              ↓
发送FIN                                                    永远停在CLOSE_WAIT
  ↓                                                              ↓
进入LAST_ACK                                                ← 常见泄漏原因！
  ↓
等待ACK
  ↓
CLOSED
```

---

## 第三步：架工具

### 关卡1：应用层工具

| 工具 | 痛点现象 | 解决方案 |
|------|----------|---------|
| strace | Python代码调用了sock.close()，但不知道内核实际执行了什么系统调用 | 追踪系统调用序列，看到API→syscall的映射，如close()→sys_close() |
| ltrace | 代码调用了shutdown()，但不知道glibc库函数如何封装 | 追踪库函数调用，看到shutdown()→__shutdown()的完整链路 |

### 关卡2：TCP状态监控工具

| 工具 | 痛点现象 | 解决方案 |
|------|----------|---------|
| ss | 大量连接停在CLOSE_WAIT，不知道是哪一步卡住了 | 查看State/Recv-Q/Send-Q，定位状态和缓冲区数据量 |
| /proc/net/tcp | ss看不到内核细节，不知道连接的完整信息 | 查看内核TCP连接表，看到本地地址、远程地址、状态原始码 |
| watch | TCP状态变化太快，ss命令刷新不过来 | 持续监控状态变化，如`watch -n 0.1 'ss -tan \| grep :8080'` |

### 关卡3：网络抓包工具

| 工具 | 痛点现象 | 解决方案 |
|------|----------|---------|
| tcpdump | 程序报错"Connection reset by peer"，但不知道是FIN还是RST | 抓取真实网络包，看到Flags=[F.]（FIN）或Flags=[R.]（RST） |
| Wireshark | tcpdump输出不够直观，想看包的详细内容 | GUI工具，过滤规则如`tcp.flags.fin == 1`，看到包的完整字段 |

---

## 🧪 实验1：close() vs shutdown() 对比

### 🎯 为什么要学这个？

**现实痛点**：
1. 客户端close()后，服务器发送的数据接收不到
2. 不知道为什么CLOSE_WAIT堆积
3. 想实现优雅关闭但不知道怎么做

### 📝 源代码

**client_close.py** - 使用close()：

```python
import socket
import time

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.connect(('127.0.0.1', 8080))

sock.send(b"[TRACER] Hello")
time.sleep(0.5)

sock.close()  # 完全关闭，销毁socket
print("[Client] 已调用close()")
```

**client_shutdown.py** - 使用shutdown()：

```python
import socket
import time

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.connect(('127.0.0.1', 8080))

sock.send(b"[TRACER] Hello")
time.sleep(0.5)

sock.shutdown(socket.SHUT_WR)  # 半关闭
print("[Client] 已调用shutdown(SHUT_WR)")

# 关键：仍可接收服务器数据
data = sock.recv(1024)
print(f"[Client] 收到: {data.decode()}")

sock.close()
```

### 💉 埋示踪

```bash
# Terminal 1: 抓包
tcpdump -i lo -n 'tcp port 8080' -vv -S > tcpdump.log 2>&1 &

# Terminal 2: 查看状态
watch -n 0.1 'ss -tan | grep :8080'

# Terminal 3: 运行server
python server.py

# Terminal 4: 运行client
python client_close.py
```

### 👀 观察分析

---

#### 🔷 观察1：应用层行为差异

##### 👁️ 观测结果

**client_close.py输出**：
```
[Client] 已调用close()
（程序立即结束，看不到服务器响应）
```

**client_shutdown.py输出**：
```
[Client] 已调用shutdown(SHUT_WR)
[Client] 收到: [Server] 我收到了你的FIN
[Client] 已close
```

##### 🔗 认知映射

```
表层现象                    底层原理
调用close()          →   发送FIN + 销毁socket文件描述符
程序无法recv         →   socket已失效，操作系统回收资源

调用shutdown()       →   发送FIN + 保留socket文件描述符
程序仍可recv         →   socket有效，接收缓冲区仍工作
```

##### 排查SOP

```
问题：close()后收不到服务器数据
  ↓
步骤1：确认API调用
  │ $ strace -e trace=close,shutdown python client_close.py
  │ close(3) = 0  ← 确认调用了close系统调用
  ↓
步骤2：观察socket状态
  │ $ ss -tan | grep :8080
  │ State = TIME_WAIT  ← 连接已关闭，无法接收数据
  ↓
步骤3：tcpdump抓包
  │ $ tcpdump -i lo -n 'tcp port 8080' -vv -S
  │ 看到服务器发送了数据包，但Client已CLOSED
  ↓
步骤4：改用shutdown()
  │ sock.shutdown(socket.SHUT_WR)
  │ 重新测试，应该能收到数据
```

---

#### 🔷 观察2：TCP抓包对比

##### 👁️ 观测结果

**使用close()的抓包**（只看关键包）：
```
13:45:22.789012 IP 127.0.0.1.52341 > 127.0.0.1.8080: Flags [F.], seq 29, ack 1, win 512
13:45:22.890123 IP 127.0.0.1.8080 > 127.0.0.1.52341: Flags [F.], seq 1, ack 30, win 512
    ↑
    服务器发送FIN，但Client已close，数据包丢失
```

**使用shutdown()的抓包**：
```
13:45:22.789012 IP 127.0.0.1.52341 > 127.0.0.1.8080: Flags [F.], seq 29, ack 1, win 512
13:45:22.800123 IP 127.0.0.1.8080 > 127.0.0.1.52341: Flags [P.], seq 1:75, ack 30, win 512
    ↑
    关键！服务器在Client FIN_WAIT_2状态下仍可发送数据
13:45:22.800456 IP 127.0.0.1.52341 > 127.0.0.1.8080: Flags [.], ack 75, win 512
13:45:22.890123 IP 127.0.0.1.8080 > 127.0.0.1.52341: Flags [F.], seq 75, ack 30, win 512
```

##### 🔗 认知映射

```
表层现象                          底层原理
close()后没有[P.]数据包    →   socket销毁，无法接收
shutdown()后有[P.]数据包   →   socket保留，仍可接收
服务器仍可发送              →   TCP双工，单向关闭不影响另一方向
```

##### 排查SOP

```
问题：close()后服务器数据丢失
  ↓
步骤1：tcpdump抓包
  │ $ tcpdump -i lo -n 'tcp port 8080' -vv -S
  ↓
步骤2：查找服务器数据包
  │ $ grep "Flags \[P.\]" tcpdump.log
  │ 看到服务器发送了[P.]数据包，携带73字节数据
  ↓
步骤3：确认Client状态
  │ $ ss -tan | grep 52341
  │ State = TIME_WAIT  ← Client已无法接收
  ↓
步骤4：对比Recv-Q
  │ 使用shutdown()时，Recv-Q = 73（有未读数据）
  │ 使用close()时，Recv-Q = 0（数据被丢弃）
  ↓
步骤5：改用shutdown()
  │ 修改代码，重新测试
```

---

#### 🔷 观察3：socket状态转换

##### 👁️ 观测结果

**使用shutdown()时ss输出**：
```
State      Recv-Q Send-Q  Local Address:Port   Peer Address:Port
ESTAB      0      0       127.0.0.1:8080       127.0.0.1:52341
FIN-W2     73     0       127.0.0.1:52341      127.0.0.1:8080
                           ↑
                       Recv-Q=73表示有73字节未读数据
CLOSE-W    0      0       127.0.0.1:8080       127.0.0.1:52341
                           ↑
                       服务器收到FIN，等待应用close()
LAST-A     0      0       127.0.0.1:8080       127.0.0.1:52341
TIME-W     0      0       127.0.0.1:52341      127.0.0.1:8080
```

**使用close()时ss输出**：
```
State      Recv-Q Send-Q  Local Address:Port   Peer Address:Port
ESTAB      0      0       127.0.0.1:8080       127.0.0.1:52352
FIN-W2     0      0       127.0.0.1.52352      127.0.0.1:8080
                           ↑
                       Recv-Q=0，数据被丢弃
TIME-W     0      0       127.0.0.1.52352      127.0.0.1:8080
```

##### 🔗 认知映射

```
表层现象                    底层原理
CLOSE_WAIT堆积        →   应用层忘记调用close()
Recv-Q > 0            →   有数据未读，应用没有及时recv
FIN_WAIT_2停留        →   等待对端发送FIN并处理完剩余数据
TIME_WAIT停留60秒     →   主动关闭方等待2MSL，防止延迟包干扰新连接
```

##### 排查SOP

```
问题：CLOSE_WAIT状态堆积
  ↓
步骤1：查看TCP状态统计
  │ $ ss -tan | awk '{print $1}' | sort | uniq -c
  │ 150 CLOSE-W  ← 大量连接停在CLOSE_WAIT
  ↓
步骤2：确认Recv-Q
  │ $ ss -tan | grep CLOSE-W
  │ Recv-Q = 0  ← 说明没有数据，但连接未关闭
  ↓
步骤3：strace追踪系统调用
  │ $ strace -e trace=close,shutdown python server.py
  │ 看到recv()返回0（收到FIN），但没有close()调用
  ↓
步骤4：检查应用代码
  │ 查找所有conn.recv() == 0的分支
  │ 是否每个分支都调用了conn.close()
  ↓
步骤5：添加finally保证close
  │ try:
  │     ...
  │ finally:
  │     conn.close()  ← 确保一定会执行
```

---

### 🎯 这个实验能解决什么问题？

| 问题 | 现象 | 根本原因 | 解决方案 |
|------|------|---------|---------|
| 客户端close后数据丢失 | 服务器发送的数据Client收不到 | close()销毁socket文件描述符，接收缓冲区失效 | 改用shutdown(SHUT_WR)半关闭，recv完数据再close() |
| CLOSE_WAIT堆积 | 大量连接停在CLOSE_WAIT，占用文件描述符 | 应用层收到FIN后忘记调用close() | 检查代码，在finally块中确保close() |
| TIME_WAIT耗尽端口 | 高并发场景下大量TIME_WAIT占用临时端口 | 主动关闭方需要等待2MSL（60秒） | 开启tcp_tw_reuse，或让服务器主动关闭 |

---

## 🧪 实验2：异常关闭场景（RST包分析）

### 🎯 为什么要学这个？

**现实痛点**：
1. 连接莫名被重置，看到"Connection reset by peer"
2. 不知道RST和FIN的区别
3. 想理解SO_LINGER选项的作用

### 📝 源代码

**client_rst.py** - 触发RST：

```python
import socket
import time

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.connect(('127.0.0.1', 8080))

sock.send(b"[TRACER] Hello")
time.sleep(0.5)

# 关键：发送缓冲区还有数据时立即close
sock.send(b"[TRACER] Data in buffer")
sock.close()  # 发送缓冲区未清空，可能触发RST
```

**client_linger.py** - 使用SO_LINGER：

```python
import socket
import struct

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# 设置SO_LINGER为0（强制关闭）
linger = struct.pack('ii', 1, 0)  # l_onoff=1, l_linger=0
sock.setsockopt(socket.SOL_SOCKET, socket.SO_LINGER, linger)

sock.connect(('127.0.0.1', 8080))
sock.send(b"[TRACER] Hello")
sock.close()  # 立即发送RST，跳过FIN握手
```

### 💉 埋示踪

```bash
# Terminal 1: 抓包
tcpdump -i lo -n 'tcp port 8080' -vv -S > tcpdump_rst.log 2>&1 &

# Terminal 2: 运行server
python server.py

# Terminal 3: 运行client
python client_rst.py
```

### 👀 观察分析

---

#### 🔷 观察1：RST包特征

##### 👁️ 观测结果

**client_rst.py的抓包**：
```
13:50:10.123456 IP 127.0.0.1.52342 > 127.0.0.1.8080: Flags [P.], seq 1:29, ack 1, win 512
13:50:10.623456 IP 127.0.0.1.52342 > 127.0.0.1.8080: Flags [R.], seq 57, win 512
    ↑
    关键！RST包，Seq=57
```

**client_linger.py的抓包**：
```
13:52:10.123456 IP 127.0.0.1.52343 > 127.0.0.1.8080: Flags [P.], seq 1:29, ack 1, win 512
13:52:10.124012 IP 127.0.0.1.52343 > 127.0.0.1.8080: Flags [R.], seq 29, win 512
    ↑
    立即发送RST（SO_LINGER=0）
```

##### 🔗 认知映射

```
表层现象                    底层原理
收到[R.]包             →   对端强制重置连接
跳过TIME_WAIT          →   RST立即CLOSED，不等待2MSL
发送缓冲区数据丢失     →   RST丢弃所有未发送数据
```

##### 排查SOP

```
问题：Connection reset by peer
  ↓
步骤1：tcpdump抓包
  │ $ tcpdump -i lo -n 'tcp port 8080' -vv
  ↓
步骤2：查找RST包
  │ $ grep "Flags \[R.\]" tcpdump.log
  │ 看到RST包，定位是哪一方发送的
  ↓
步骤3：检查发送方代码
  │ 是否在close()时有未发送数据？
  │ 是否设置了SO_LINGER=0？
  ↓
步骤4：修复方案
  │ 方案A：确保数据发送完再close()
  │ 方案B：改用shutdown()优雅关闭
  │ 方案C：不要设置SO_LINGER=0（除非确实需要强制关闭）
```

---

#### 🔷 观察2：RST vs FIN对比

##### 👁️ 观测结果

| 特征 | FIN包 | RST包 |
|------|-------|-------|
| TCP标志 | Flags [F.] | Flags [R.] |
| Seq/Ack | 正常序列号 | 可能任意Seq |
| 状态转换 | ESTAB → FIN-W1 → FIN-W2 → TIME-W → CLOSED | **ESTAB → CLOSED（立即）** |
| 数据处理 | 等待发送缓冲区清空 | **丢弃发送缓冲区所有数据** |
| 对端影响 | 收到FIN后可以继续发送数据 | 收到RST立即关闭，丢弃未接收数据 |

##### 🔗 认知映射

```
表层现象                    底层原理
FIN四次握手            →   优雅关闭，确保数据完整
RST立即关闭            →   强制关闭，丢弃数据
发送缓冲区有数据时close →   触发RST（默认行为）
SO_LINGER=0           →   强制发送RST
```

---

### 🎯 这个实验能解决什么问题？

| 问题 | 现象 | 根本原因 | 解决方案 |
|------|------|---------|---------|
| Connection reset by peer | 应用抛出ConnectionResetError异常 | 对端发送了RST包，可能是close()时有未发送数据 | 确保数据发送完再close()，或用shutdown() |
| 数据莫名丢失 | 发送数据后立即close()，数据丢失 | 触发RST，发送缓冲区被丢弃 | 使用shutdown()等待对端ACK，或设置SO_LINGER等待 |
| 无法重连 | socket异常关闭后无法重连 | RST导致连接异常终止 | 检测到RST后创建新socket重新connect() |

---

## 🧪 实验3：破坏性验证（边界测试）

### 🎯 为什么要破坏？

建立认知模型后，必须验证边界和异常情况，才能理解系统的真实行为。

### 📝 源代码

**stress_close.py** - 压力测试：

```python
import socket
import time

def test_time_wait_exhaustion():
    """破坏1: 循环创建/关闭连接，耗尽临时端口"""
    count = 0
    while True:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.connect(('127.0.0.1', 8080))
            sock.send(b"[TRACER] Hello")
            sock.close()  # 主动关闭，进入TIME_WAIT
            count += 1
            if count % 100 == 0:
                print(f"[TRACER] 已创建{count}个连接")
        except OSError as e:
            print(f"[TRACER] 失败！在{count}个连接后: {e}")
            break

def test_close_wait_leak():
    """破坏2: 模拟CLOSE_WAIT泄漏"""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect(('127.0.0.1', 8080))
    sock.send(b"[TRACER] Hello")

    # 关键：shutdown(SHUT_WR)发送FIN，但不close()
    sock.shutdown(socket.SHUT_WR)
    print("[TRACER] 已发送FIN，但不close，模拟泄漏")
    time.sleep(300)  # 保持5分钟

test_close_wait_leak()
```

### 💉 埋示踪

```bash
# Terminal 1: 监控TCP状态
watch -n 1 'ss -tan | grep :8080 | awk "{print \$1}" | sort | uniq -c'

# Terminal 2: 运行压力测试
python stress_close.py

# 预期输出：
# [TRACER] 已创建100个连接
# [TRACER] 失败！在28000个连接后: Cannot assign requested address
```

### 👀 观察分析

---

#### 🔷 观察1：TIME_WAIT堆积

##### 👁️ 观测结果

**ss输出**：
```
State      Recv-Q Send-Q  Local Address:Port
TIME-WAIT  0      0       127.0.0.1:52345
TIME-WAIT  0      0       127.0.0.1:52346
TIME-WAIT  0      0       127.0.0.1:52347
...
（数千个TIME_WAIT）
```

**系统限制**：
```bash
$ cat /proc/sys/net/ipv4/ip_local_port_range
32768   60999
# 可用端口数 = 60999 - 32768 = 28231
```

##### 🔗 认知映射

```
表层现象                    底层原理
循环创建连接          →   每次主动关闭都进入TIME_WAIT
TIME_WAIT堆积         →   占用临时端口，耗尽后无法创建新连接
等待60秒              →   2MSL机制，防止延迟包干扰新连接
```

##### 排查SOP

```
问题：Cannot assign requested address（端口耗尽）
  ↓
步骤1：查看TIME_WAIT数量
  │ $ ss -tan | grep TIME-WAIT | wc -l
  │ 25000  ← 接近临时端口上限
  ↓
步骤2：查看临时端口范围
  │ $ cat /proc/sys/net/ipv4/ip_local_port_range
  │ 32768-60999  ← 只有28231个可用端口
  ↓
步骤3：调优参数
  │ # 方案A：扩大临时端口范围
  │ sysctl -w net.ipv4.ip_local_port_range="1024 65535"
  │
  │ # 方案B：开启tcp_tw_reuse（推荐）
  │ sysctl -w net.ipv4.tcp_tw_reuse=1
  │
  │ # 方案C：调低TIME_WAIT时长（不推荐）
  │ sysctl -w net.ipv4.tcp_fin_timeout=30
  ↓
步骤4：永久生效
  │ vi /etc/sysctl.conf
  │ net.ipv4.tcp_tw_reuse=1
  │ sysctl -p
```

---

#### 🔷 观察2：CLOSE_WAIT泄漏

##### 👁️ 观测结果

**服务器端ss输出**：
```
State      Recv-Q Send-Q  Local Address:Port   Peer Address:Port
CLOSE-W    0      0       127.0.0.1:8080       127.0.0.1.52350
CLOSE-W    0      0       127.0.0.1:8080       127.0.0.1.52351
CLOSE-W    0      0       127.0.0.1:8080       127.0.0.1:52352
...
（持续增加，Recv-Q=0说明没有数据，但连接未关闭）
```

##### 🔗 认知映射

```
表层现象                    底层原理
CLOSE_WAIT堆积        →   应用收到FIN但未调用close()
Recv-Q = 0            →   没有未读数据，但连接未释放
占用文件描述符        →   泄漏会耗尽fd上限，导致新连接无法建立
```

##### 排查SOP

```
问题：CLOSE_WAIT堆积
  ↓
步骤1：查看CLOSE_WAIT数量
  │ $ ss -tan | grep CLOSE-W | wc -l
  │ 150  ← 异常堆积
  ↓
步骤2：确认Recv-Q
  │ $ ss -tan | grep CLOSE-W
  │ Recv-Q = 0  ← 没有数据，但应用没close
  ↓
步骤3：lsof查找泄漏的fd
  │ $ lsof -p <server_pid> | grep TCP
  │ 看到大量CLOSE_WAIT的socket fd
  ↓
步骤4：strace追踪系统调用
  │ $ strace -e trace=close,shutdown -p <server_pid>
  │ 看到recv()返回0（收到FIN），但没有后续close()
  ↓
步骤5：代码review
  │ 查找所有conn.recv() == 0的分支
  │ 确保每个分支都调用了conn.close()
  ↓
步骤6：添加finally保证close
  │ try:
  │     data = conn.recv(1024)
  │     if not data:
  │         ...  # 任何一个分支都要close
  │ finally:
  │     conn.close()  ← 确保一定会执行
```

---

### 🎯 这个实验能解决什么问题？

| 问题 | 现象 | 根本原因 | 解决方案 |
|------|------|---------|---------|
| 端口耗尽 | 新连接报错"Cannot assign requested address" | TIME_WAIT堆积占用临时端口 | 开启tcp_tw_reuse=1，或使用连接池 |
| CLOSE_WAIT泄漏 | 大量连接停在CLOSE_WAIT，占用fd | 应用忘记close() | 在finally块中确保close() |
| 文件描述符耗尽 | "Too many open files" | CLOSE_WAIT泄漏或其他资源未释放 | lsof查找泄漏的fd，代码review |

---

## 📚 总结与最佳实践

### 核心发现

1. **close() vs shutdown()**
   - close() = 发送FIN + 销毁socket（无法接收对端数据）
   - shutdown(SHUT_WR) = 发送FIN + 保留socket（仍可接收对端数据）

2. **TCP状态机**
   - 主动关闭：ESTAB → FIN-W1 → FIN-W2 → TIME-W（60秒） → CLOSED
   - 被动关闭：ESTAB → CLOSE-W（等待应用close） → LAST-A → CLOSED

3. **FIN vs RST**
   - FIN = 优雅关闭，遵循四次握手
   - RST = 强制关闭，立即CLOSED，丢弃数据

### 最佳实践

#### ✅ 推荐做法

```python
# 1. 优雅关闭流程
def graceful_close(sock):
    try:
        sock.shutdown(socket.SHUT_WR)  # 发送FIN
        while True:
            data = sock.recv(4096)
            if not data:
                break  # 对端也发送FIN了
    except:
        pass
    finally:
        sock.close()  # 确保一定会close

# 2. 防止CLOSE_WAIT泄漏
try:
    data = conn.recv(1024)
    if not data:
        ...  # 业务逻辑
finally:
    conn.close()  # 任何异常分支都会执行

# 3. 高并发场景
# 让服务器主动关闭，避免客户端TIME_WAIT堆积
```

#### ❌ 避免陷阱

```python
# 陷阱1: 直接close丢失数据
sock.send(data)
sock.close()  # 发送缓冲区数据可能丢失

# 陷阱2: 忘记close导致CLOSE_WAIT
data = sock.recv(1024)
if not data:
    return  # 忘记close()！

# 陷阱3: 循环创建连接耗尽端口
for i in range(100000):
    sock = socket.socket()
    sock.connect(server)
    sock.close()  # 客户端主动关闭，TIME_WAIT堆积
```

### 实用排查命令速查

```bash
# 1. 查看TCP状态统计
ss -tan | awk '{print $1}' | sort | uniq -c

# 2. 查看特定端口的连接
ss -tan | grep :8080

# 3. 查看进程的socket
lsof -p <pid> | grep TCP

# 4. 抓取TCP关闭包
tcpdump -i lo -n 'tcp port 8080 and (tcp[tcpflags] & tcp-fin != 0 or tcp[tcpflags] & tcp-rst != 0)' -vv -S

# 5. 追踪系统调用
strace -e trace=socket,connect,send,recv,close,shutdown python app.py

# 6. 查看内核TCP参数
sysctl net.ipv4.tcp_fin_timeout
sysctl net.ipv4.tcp_tw_reuse
sysctl net.ipv4.ip_local_port_range
```

---

## 🔍 快速问题定位指南

| 现象 | 第一步检查 | 第二步检查 | 最终解决方案 |
|------|----------|----------|------------|
| 数据丢失 | tcpdump看到服务器发送了数据 | ss看到Client已TIME_WAIT | 改用shutdown(SHUT_WR) |
| CLOSE_WAIT堆积 | ss看到大量CLOSE_WAIT | lsof看到应用未close | 在finally中close() |
| 端口耗尽 | ss看到大量TIME_WAIT | sysctl看到临时端口上限 | 开启tcp_tw_reuse=1 |
| Connection reset | tcpdump看到RST包 | 检查close()时是否有未发送数据 | 确保数据发送完再close |

---

**记住**：罗塞塔石碑方法的核心是**对照**。通过已知的代码和未知的底层输出，建立映射关系，就能破译任何黑盒系统。

现在你已经掌握了TCP关闭机制的底层原理，可以快速定位和解决实际问题了！
