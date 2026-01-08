---
title: "Network Stack Deep Dive"
date: 2026-01-07
categories: ["CS"]
tags: ["cs"]
---


# macOS 网络底层机制学习链路设计

## 一、技术栈分层分析（从应用到内核）

这段防火墙脚本涉及的技术栈层次：

```
┌─────────────────────────────────────────────────────┐
│ Layer 7: Python 脚本 (应用层)                        │
│  - subprocess.call(['pfctl', '-e'])                  │
│  - 写入配置文件                                       │
└─────────────────────────────────────────────────────┘
                        ↓ syscall
┌─────────────────────────────────────────────────────┐
│ Layer 6: libc / libSystem (系统调用层)               │
│  - execve() 执行 pfctl 命令                          │
│  - socket() / ioctl() 网络相关调用                   │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ Layer 5: pfctl 用户态工具 (XNU 工具层)               │
│  - 解析配置语法                                       │
│  - 通过 ioctl() 与内核通信                           │
└─────────────────────────────────────────────────────┘
                        ↓ ioctl / netlink
┌─────────────────────────────────────────────────────┐
│ Layer 4: XNU 内核态 (Darwin 核心)                    │
│  ├── BSD 子系统: /bsd/net/pf.c                      │
│  ├── Packet Filter (pf) 驱动                         │
│  └── 规则匹配引擎                                     │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ Layer 3: 网络协议栈 (Protocol Stack)                 │
│  ├── TCP/UDP 协议处理                                │
│  ├── Socket 层 (sys/socket.h)                       │
│  └── 路由表 / NAT                                    │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ Layer 2: 数据链路层 (Data Link)                     │
│  ├── ifnet 接口抽象                                  │
│  ├── BPF (Berkeley Packet Filter)                   │
│  └── 网卡驱动 (en0, en1...)                          │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ Layer 1: 硬件层 (Network Interface)                 │
│  ├── Wi-Fi 芯片 (802.11)                             │
│  └── Ethernet 控制器                                 │
└─────────────────────────────────────────────────────┘
```

## 二、核心知识点拆解

### 2.1 协议层知识点
**为什么 UDP 443 能绕过 Hosts 限制？**

| 协议 | 端口 | DNS 解析 | Hosts 生效 | 代理绕过 | YouTube 使用 |
|------|------|----------|-----------|----------|--------------|
| HTTP (TCP) | 80 | ✅ | ✅ | ✅ | ❌ (已废弃) |
| HTTPS (TCP) | 443 | ✅ | ✅ | ✅ | ✅ (降级) |
| HTTP/3 QUIC (UDP) | 443 | ✅ | ❌ | ⚠️ 易穿透 | ✅ (首选) |

**关键技术点**：
1. **QUIC 协议特点**：
   - 基于 UDP 传输
   - 内置 TLS 1.3 加密
   - 多路复用（避免 HOL 阻塞）
   - 连接迁移（IP 变化不中断）

2. **Hosts 文件的作用域**：
   ```bash
   # /etc/hosts 只影响 DNS 解析阶段
   127.0.0.1 youtube.com  # 让 DNS 返回 127.0.0.1

   # 但如果客户端已经有了 IP 地址（缓存）
   # 或者使用了 DoH (DNS over HTTPS)
   # Hosts 就失效了
   ```

3. **代理 Bypass 的局限**：
   - 系统代理设置主要影响 HTTP/HTTPS (TCP)
   - UDP 流量在 macOS 上经常绕过代理设置
   - TUN 模式的 VPN 会捕获所有流量，包括 UDP

### 2.2 pfctl 生态链

**1) PF 规则语法**
```pf
# 基础语法
block drop out proto udp from any to any port 443

# 拆解：
# block    - 动作：阻止 (pass / block)
# drop     - 选项：丢弃包 (return 发送 RST)
# out      - 方向：outbound / in / all
# proto udp- 协议：tcp / udp / icmp / etc
# from any - 源地址：any / 192.168.1.0/24
# to any   - 目标地址
# port 443 - 目标端口
```

**2) pfctl 核心命令**
```bash
# 加载配置
sudo pfctl -f /etc/pf.conf

# 启用/禁用防火墙
sudo pfctl -e  # enable
sudo pfctl -d  # disable

# 查看规则
sudo pfctl -s rules

# 查看状态
sudo pfctl -s info

# 清空规则
sudo pfctl -F all

# 查看匹配计数
sudo pfctl -v -s rules
```

**3) PF 内核源码位置**
```c
// XNU 源码 (https://github.com/apple/darwin-xnu)
bsd/net/pf/          # PF 核心实现
├── pf.c             # 主逻辑
├── pf_ioctl.c       # ioctl 接口
├── pf_norm.c        # 规范化
├── pf_rules.c       # 规则引擎
└── pf_if.c          # 接口处理
```

## 三、学习链路设计（6 阶段）

### 阶段 0：目标锚定（Goal Anchoring）
**你的目标**：从"会用 pfctl"到"理解网络包从应用到网卡的完整路径"

**能力拆解**：
- [ ] 能看懂 PF 规则语法
- [ ] 理解 TCP/UDP 协议栈差异
- [ ] 能用 tcpdump/wireshark 抓包分析
- [ ] 理解 XNU 内核网络架构
- [ ] 能阅读内核源码（pf.c）
- [ ] 能扩展 PF 功能或编写自己的防火墙规则

### 阶段 1：压缩编码（建立知识索引）

**必背术语表**：
| 术语 | 含义 | 示例 |
|------|------|------|
| PF | Packet Filter | OpenBSD 防火墙，macOS 沿用 |
| ioctl | I/O Control | 用户态与内核态通信接口 |
| BPF | Berkeley Packet Filter | 数据包捕获机制 |
| QUIC | Quick UDP Internet Connections | HTTP/3 底层协议 |
| TUN | 虚拟网络设备 (Layer 3) | VPN 隧道网卡 |
| TAP | 虚拟网络设备 (Layer 2) | 桥接模式网卡 |
| mDNS | Multicast DNS | 本地主机名解析 (.local) |

**核心概念映射**：
```
用户态命令 → 系统调用 → 内核驱动 → 硬件
pfctl      → ioctl()  → pf_ioctl → ifnet
```

### 阶段 2：信号通路（建立最小可观测系统）

**实验 1：观察 UDP/TCP 差异**
```bash
# 1. 开启抓包（只看 443 端口）
sudo tcpdump -i any port 443 -n

# 2. 用 curl 访问 YouTube（TCP）
curl -v https://www.youtube.com

# 3. 用 Safari 访问 YouTube（会尝试 QUIC）
# 观察抓包输出中的协议差异
```

**预期输出**：
```
# TCP 握手
IP 192.168.1.100.54321 > 142.250.185.78.443: Flags [S]
IP 142.250.185.78.443 > 192.168.1.100.54321: Flags [S.]
IP 192.168.1.100.54321 > 142.250.185.78.443: Flags [A]

# UDP QUIC
IP 192.168.1.100.54321 > 142.250.185.78.443: UDP
```

**实验 2：追踪 PF 规则匹配**
```bash
# 1. 加载带日志的规则
echo "block log in proto udp from any to any port 443" | sudo pfctl -f -

# 2. 查看实时日志
sudo pfctl -s info

# 3. 查看 PF 统计
sudo pfctl -v -s rules  # 显示每条规则的匹配次数
```

### 阶段 3：解调分析（通过"为什么"链理解机制）

**核心问题链**：

**Q1: 为什么 block drop 不会发送 RST 包？**
```c
// 在 bsd/net/pf.c 中
if (r->rule_flag & PFRULE_DROP) {
    // 丢弃包，不发送任何响应
    m_freem(m);  // 释放 mbuf
    return;
}

// 如果是 block return（没有 drop）
if (r->rule_flag & PFRULE_RETURN) {
    // 发送 TCP RST 或 ICMP 不可达
    pf_send_tcp(rst);  // 构造并发送 RST 包
}
```

**Q2: ioctl() 如何将规则传递给内核？**
```c
// 用户态 (pfctl 源码)
struct pfioc_rule pr;
// 填充 pr 结构体
ioctl(dev, DIOCADDRULE, &pr);  // 系统调用

// 内核态 (bsd/net/pf_ioctl.c)
pf_ioctl(struct proc *p, struct pf_ioctl *uap)
{
    switch (uap->com) {
        case DIOCADDRULE:
            pf_add_rule(&uap->rule);  // 添加规则到内核链表
            break;
    }
}
```

**Q3: Safari 如何决定使用 QUIC 还是 TCP？**
```
1. Safari 首先尝试 HTTPS (TCP)
2. 服务器返回 Alt-Svc: h3=":443"
3. Safari 记住这个偏好
4. 下次直接发起 QUIC 连接（UDP 443）
5. 如果 QUIC 失败，3 次重试后降级到 TCP
```

### 阶段 4：破坏性测试（通过边界理解极限）

**测试 1：单点破坏**
```bash
# 只禁用 UDP，观察应用行为
echo "block out proto udp from any to any port 443" | sudo pfctl -f -
sudo pfctl -e

# 打开 Safari 访问 YouTube
# 观察地址栏：是否从 https:// 变成 h3:// 然后失败？
```

**测试 2：组合破坏**
```bash
# 同时禁用 UDP 和 TCP 443，保留 80
cat <<EOF | sudo pfctl -f -
block out proto udp from any to any port 443
block out proto tcp from any to any port 443
pass out proto tcp from any to any port 80
EOF

# 访问 http://www.youtube.com (会跳转到 https，失败)
```

**测试 3：压力测试**
```bash
# 用 hping3 发送 UDP 包测试防火墙性能
hping3 -2 -p 443 -c 10000 google.com

# 观察系统负载
top -o cpu
vm_stat

# 查看丢包统计
netstat -s | grep "dropped"
```

### 阶段 5：验证与对齐（通过费曼技巧验证理解）

**费曼技巧测试题**：
1. "用白话解释为什么 UDP 443 能绕过 Hosts 文件"
2. "画图说明一个网络包从 Python 脚本到网卡的完整路径"
3. "如果 YouTube 改用 TCP 8080 端口，防火墙规则该怎么写？"

**极端假设**：
- "如果 macOS 没有 PF 内核模块，Python 还能封禁端口吗？"
  - 答：只能用 ipfw (已废弃) 或应用层防火墙
- "如果 YouTube 使用 DoH (DNS over HTTPS)，Hosts 文件会失效吗？"
  - 答：会，因为 DNS 查询走 HTTPS 443，绕过系统 DNS 解析

### 阶段 6：编码到长期记忆（建立知识卡片）

**Anki 卡片示例**：
```
Q: PF 防火墙的 block drop 和 block return 有什么区别？
A: drop 静默丢弃包，return 发送 RST/ICMP 不可达

Q: 为什么 QUIC 协议难以被防火墙识别？
A: 基于 UDP，端口 443 与 HTTPS 混淆，流量加密

Q: ioctl() 在防火墙中的作用？
A: 用户态与内核态通信接口，传递规则配置
```

**复习间隔**：1 天 → 3 天 → 1 周 → 2 周 → 1 月 → 3 月

## 四、可落地的实验步骤

### 第 1 周：建立观测能力
```bash
# Day 1-2: 抓包基础
brew install wireshark
sudo wireshark  # 图形化抓包

# Day 3-4: 命令行抓包
man tcpdump
sudo tcpdump -i any -n 'host youtube.com'

# Day 5-7: PF 基础操作
man pfctl
man pf.conf
# 编写自己的第一个 PF 规则
```

### 第 2 周：深入内核
```bash
# Day 8-10: 阅读 XNU 源码
git clone https://github.com/apple/darwin-xnu.git
cd darwin-xnu/bsd/net/pf
less pf.c  # 阅读核心逻辑

# Day 11-12: 编译调试内核（可选）
# 需要安装 Xcode 和交叉编译工具链
# 注意：非常复杂，不建议初学者尝试

# Day 13-14: BPF 过滤器
man bpf
sudo tcpdump -i any 'udp[10:2] = 0x5205'  # 匹配 QUIC 包头
```

### 第 3 周：实战项目
```bash
# 实战 1: 监控特定应用的流量
lsof -i -n -P | grep Chrome  # 查看进程连接
sudo pfctl -s state | grep chrome

# 实战 2: 编写高级 PF 规则
table <blocked> persist file "/etc/blocked_ips.txt"
block drop from <blocked> to any

# 实战 3: 使用 Python 监控 PF 统计
import subprocess
output = subprocess.check_output(['pfctl', '-s', 'info'])
# 解析并绘制图表
```

### 第 4 周：扩展与整合
- 研究 WireGuard/OpenVPN 的 TUN 设备实现
- 对比 Linux iptables 与 macOS PF 的差异
- 阅读 "TCP/IP Illustrated, Volume 2" (内核实现)
- 实现 Python 版的简单包过滤工具（使用 raw socket）

## 五、推荐学习资源

**书籍**：
1. "TCP/IP Illustrated, Volume 1" (协议原理)
2. "Unix Network Programming, Volume 1" (系统编程)
3. "The Design and Implementation of the FreeBSD Operating System" (内核架构)

**源码**：
1. https://github.com/apple/darwin-xnu (XNU 内核)
2. https://github.com/freebsd/freebsd-src (FreeBSD，PF 的起源)
3. https://www.chromium.org/quic (QUIC 协议实现)

**工具**：
1. Wireshark (图形化抓包)
2. tcpdump (命令行抓包)
3. lsof (查看文件/网络描述符)
4. netstat (网络统计)
5. dtrace (动态追踪，macOS)

**在线资源**：
1. PF 官方文档：https://www.openbsd.org/faq/pf/
2. QUIC 协议：https://datatracker.ietf.org/wg/quic/about/
3. macOS 内核编程指南：https://developer.apple.com/library/archive/documentation/Darwin/Conceptual/KernelProgramming/

## 六、检查清单 (Learning Checklist)

完成以下项目，证明你已经掌握：

- [ ] 能独立编写 PF 规则封禁特定端口
- [ ] 能用 tcpdump 分析 HTTPS 握手过程
- [ ] 理解 QUIC 协议的数据包结构
- [ ] 能看懂 XNU 源码中的 pf.c 关键函数
- [ ] 能解释为什么 YouTube 在 TUN 模式下能绕过代理
- [ ] 能用 ioctl() 编写简单的用户态程序与内核通信
- [ ] 理解 mbuf（内存缓冲区）在网络栈中的作用

---

**最终目标**：从"知道 PF 命令"进化到"能自己实现简单的防火墙内核模块"
