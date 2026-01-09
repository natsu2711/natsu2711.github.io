---
title: "High Performance Inference Mesh Learning Roadmap"
date: 2026-01-09
categories: ["AI"]
tags: ["roadmap", "C++", "Java", "learning"]
---


# 高性能 AI 推理中台项目 - 系统化学习路线

> 基于 `master-complex-domain` 6阶段学习框架
> 目标：构建生产级 C++/Java 异构架构的 AI 推理平台
> 生成时间：2026-01-09

---

## 📋 项目概览

### 核心技术栈
```
┌─────────────────────────────────────────────────────────┐
│          高性能 AI 推理中台 (AI Serving Mesh)            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐   ┌─────────────┐   ┌──────────────┐  │
│  │ C++ 底层引擎 │ → │ Java 管理层 │ → │ AI 评测系统  │  │
│  │             │   │             │   │              │  │
│  │ • CUDA/eBPF │   │ • Spring    │   │ • AST 分析   │  │
│  │ • 共享内存  │   │ • 微服务    │   │ • LLM-Judge  │  │
│  │ • JNI优化   │   │ • WebSocket │   │ • 自动测试   │  │
│  └─────────────┘   └─────────────┘   └──────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 第0阶段：目标锚定

### 三问法（问题驱动）

#### Q1: 你要解决什么具体问题？
**不是"学习C++/Java"，而是"构建一个能解决X的系统"**

**具体问题场景**：
1. **性能瓶颈问题**：如何在高并发场景下（QPS > 10000）实现 AI 模型的低延迟推理（P99 < 50ms）？
2. **跨语言调用损耗**：Java 通过 JNI 调用 C++ 的性能开销如何降低到 < 1ms？
3. **代码质量自动化**：如何对大模型生成的 C++/Java 代码进行自动化质量评测和安全检测？

#### Q2: 3周后，你要能完成哪个可演示任务？
**最小可行产品（MVP）**：

- [ ] **Week 1**: C++ 基础推理引擎（单模型、单请求）
  - 输入：Python 脚本发送 HTTP 请求
  - 输出：C++ 引擎返回推理结果
  - 指标：端到端延迟 < 100ms

- [ ] **Week 2**: Java 微服务层 + JNI 优化
  - 输入：Java API 接收请求
  - 输出：通过共享内存传递给 C++，返回结果
  - 指标：JNI 调用开销 < 5ms

- [ ] **Week 3**: 代码评测流水线
  - 输入：LLM 生成的 C++ 代码片段
  - 输出：静态分析报告 + 单元测试结果
  - 指标：能检测出 80% 的常见 bug（内存泄漏、空指针、并发问题）

#### Q3: 这个领域 80% 场景下，最核心的 20% 是什么？

**核心 20%（必须掌握的支柱）**：

| 支柱 | C++ 方向 | Java 方向 | AI 评测方向 |
|------|----------|-----------|-------------|
| **内存管理** | 共享内存、零拷贝 | JVM 调优、堆外内存 | N/A |
| **并发模型** | 线程池、异步 I/O | Reactor 模型、WebFlux | N/A |
| **通信机制** | eBPF/共享内存 | WebSocket/gRPC | N/A |
| **性能分析** | perf/火焰图 | JProfiler/Arthas | N/A |
| **代码分析** | N/A | N/A | AST、符号执行 |

---

### 问题-知识映射表

| 问题场景 | 需要的概念 | 优先级 | 所属轨道 |
|---------|-----------|--------|----------|
| Java 调用 C++ 太慢 | JNI、共享内存、序列化 | P0 | C++-Java 桥接 |
| 高并发下内存溢出 | 内存池、对象池、引用计数 | P0 | C++ 内存管理 |
| 模型加载慢 | 延迟加载、模型分片、缓存 | P0 | C++ 引擎设计 |
| 微服务雪崩效应 | 熔断、限流、降级 | P0 | Java 微服务 |
| 代码质量不可控 | AST、静态分析、fuzzing | P0 | AI 评测系统 |
| 数据传输延迟高 | 零拷贝、RDMA、eBPF | P1 | C++-Java 桥接 |
| 模型版本混乱 | 灰度发布、AB 测试 | P1 | Java 微服务 |
| 测试用例生成难 | 符号执行、覆盖率分析 | P1 | AI 评测系统 |

---

### ROI 雷达图

```
        深度
        ↑
    高  │  ● C++ 内存管理 (核心)
        │  ● Java 并发 (核心)
        │  ● AST 分析 (核心)
        │
        │
    低  │     ● eBPF (边缘)
        │     ● K8s 运维 (可外包)
        └──────────────→ 覆盖度
           低    高
```

**决策**：
- ✅ **深度学习**：C++ 内存管理、Java 并发、AST 分析（核心支柱）
- ⚠️ **适度学习**：共享内存、WebSocket、gRPC（高频但可查）
- ❌ **暂不学习**：K8s 编排、前端开发、数据库优化（非核心）

---

### 止损失限

- **时间预算**：
  - Week 1: 40 小时（C++ 引擎）
  - Week 2: 40 小时（Java 微服务）
  - Week 3: 40 小时（AI 评测）
  - 总计：120 小时（3 个月，每周 10 小时）

- **深度边界**：
  - ✅ 达到"能用"：能搭建 MVP、能读懂源码、能调参优化
  - ❌ 不追求"完全理解"：不纠结底层汇编、不优化到极致、不覆盖所有 edge case

---

## 第1阶段：压缩编码（知识索引）

### 三书目录对比法

**推荐教材（选 3 本）**：

#### C++ 方向
1. **《Effective C++》** - Scott Meyers
   - 重点：第 4 章（对象管理）、第 7 章（内存管理）
2. **《Linux高性能服务器编程》** - 游双
   - 重点：第 5 章（I/O 模型）、第 9 章（内存池）
3. **《CUDA编程指南》** - NVIDIA 官方文档
   - 重点：第 3 章（CUDA C）、第 6 章（流与并发）

#### Java 方向
1. **《深入理解 Java 虚拟机》** - 周志明
   - 重点：第 2 章（内存管理）、第 5 章（编译优化）
2. **《Spring Cloud 微服务实战》** - 翟永超
   - 重点：第 3 章（服务调用）、第 6 章（熔断降级）
3. **《Netty 实战》** - Norman Maurer
   - 重点：第 5 章（ByteBuf）、第 7 章（线程模型）

#### AI 评测方向
1. **《编译原理》** - 龙书
   - 重点：第 4 章（语法分析）、第 6 章（语义分析）
2. **《软件测试》** - Myers
   - 重点：第 3 章（测试用例设计）、第 7 章（自动化测试）
3. **《静态程序分析》** - Anders Møller
   - 重点：第 2 章（数据流分析）、第 4 章（指针分析）

**章节重合度分析**（示例）：

| 主题 | 书1 | 书2 | 书3 | 重合度 | 分类 |
|------|-----|-----|-----|--------|------|
| 内存管理 | ✅ | ✅ | ✅ | 3次 | **核心支柱** |
| 并发控制 | ✅ | ✅ | - | 2次 | 重要概念 |
| 零拷贝 | ✅ | - | ✅ | 2次 | 重要概念 |
| eBPF | ✅ | - | - | 1次 | 边缘知识 |
| K8s | - | ✅ | - | 1次 | 边缘知识 |

---

### 黑话词典（30个核心术语）

#### C++ 轨道（10个）
```
术语：共享内存 (Shared Memory)
一句话定义：多个进程访问同一块物理内存，无需数据拷贝
典型场景：Java 与 C++ 高速通信
它不是什么：不是消息队列（有拷贝开销）、不是 Socket（网络开销）

术语：零拷贝 (Zero-copy)
一句话定义：数据在内核态与用户态之间不发生复制
典型场景：文件传输、显卡渲染
它不是什么：不是不拷贝，而是减少不必要的拷贝

术语：对象池 (Object Pool)
一句话定义：预先分配对象，用完归还而非销毁
典型场景：频繁创建/销毁的场景（数据库连接、线程）
它不是什么：不是缓存（缓存是数据，对象池是对象）

术语：内存对齐 (Memory Alignment)
一句话定义：数据按特定边界存放，CPU 一次读取
典型场景：结构体定义、SIMD 指令
它不是什么：不是填充（padding 是手段，对齐是目的）

术语：RAII (资源获取即初始化)
一句话定义：对象生命周期绑定资源，析构时自动释放
典型场景：文件句柄、锁、智能指针
它不是什么：不是垃圾回收（GC 是运行时，RAII 是编译时）

术语：虚函数表 (vtable)
一句话定义：存储类的虚函数地址，实现多态
典型场景：继承、接口
它不是什么：不是虚函数本身（vtable 是指针数组）

术语：移动语义 (Move Semantics)
一句话定义：转移所有权而非拷贝，提升性能
典型场景：返回大对象、std::vector 扩容
它不是什么：不是指针传递（移动后原对象失效）

术语：内存屏障 (Memory Barrier)
一句话定义：强制 CPU 刷新缓存，保证多线程可见性
典型场景：无锁编程、volatile
它不是什么：不是锁（屏障是硬件指令，锁是软件逻辑）

术语：SIMD (单指令多数据)
一句话定义：一条指令同时处理多个数据
典型场景：图像处理、矩阵运算
它不是什么：不是多线程（SIMD 是 CPU 并行，线程是任务并行）

术语：CUDA 流 (CUDA Stream)
一句话定义：一系列按顺序执行的 CUDA 操作
典型场景：GPU 任务并行、数据传输与计算重叠
它不是什么：不是线程（流是 GPU 的调度单位）
```

#### Java 轨道（10个）
```
术语：JNI (Java Native Interface)
一句话定义：Java 调用 C/C++ 代码的标准接口
典型场景：高性能计算、调用系统库
它不是什么：不是 RPC（JNI 是进程内，RPC 是跨进程）

术语：JVM 堆外内存 (Off-heap Memory)
一句话定义：不受 GC 管理的直接内存
典型场景：NIO 缓冲区、共享内存映射
它不是什么：不是栈内存（栈是线程私有，堆外是全局共享）

术语：Reactor 模式
一句话定义：事件驱动的非阻塞 I/O 模型
典型场景：Netty、Node.js、WebFlux
它不是什么：不是多线程（Reactor 是单线程事件循环）

术语：背压 (Backpressure)
一句话定义：下游处理慢时，通知上游降低发送速率
典型场景：流式处理、消息队列
它不是什么：不是限流（背压是自动反馈，限流是主动策略）

术语：熔断器 (Circuit Breaker)
一句话定义：检测到故障时，快速失败而非阻塞
典型场景：微服务调用链
它不是什么：不是重试（熔断是保护，重试是恢复）

术语：服务网格 (Service Mesh)
一句话定义：基础设施层的微服务通信代理
典型场景：K8s、Istio、Linkerd
它不是什么：不是 API 网关（网关是入口，Mesh 是东西向）

术语：灰度发布 (Canary Deployment)
一句话定义：逐步将新版本流量从 0% 提升到 100%
典型场景：降低发布风险
它不是什么：不是 AB 测试（灰度是发布策略，AB 是实验方法）

术语：分布式追踪 (Distributed Tracing)
一句话定义：跟踪请求在多个服务间的完整路径
典型场景：调试微服务性能瓶颈
它不是什么：不是日志（追踪是链路，日志是离散事件）

术语：限流算法 (Rate Limiting)
一句话定义：控制请求速率，保护系统稳定性
典型场景：令牌桶、漏桶、滑动窗口
它不是什么：不是熔断（限流是预防，熔断是止损）

术语：gRPC (Google Remote Procedure Call)
一句话定义：基于 HTTP/2 和 Protobuf 的高性能 RPC 框架
典型场景：微服务间通信
它不是什么：不是 REST（gRPC 是二进制协议，REST 是文本）
```

#### AI 评测轨道（10个）
```
术语：AST (抽象语法树)
一句话定义：源代码的树状结构表示，捕获语法和层次
典型场景：代码分析、编译器前端
它不是什么：不是解析树（AST 抽略了语法细节）

术语：符号执行 (Symbolic Execution)
一句话定义：用符号代替具体值，探索所有执行路径
典型场景：漏洞检测、路径覆盖
它不是什么：不是模糊测试（符号执行是静态分析，fuzzing 是动态测试）

术语：数据流分析 (Data Flow Analysis)
一句话定义：跟踪数据在程序中的流动和变换
典型场景：编译优化、死代码消除
它不是什么：不是控制流分析（数据流关注值，控制流关注路径）

术语：静态单赋值 (SSA)
一句话定义：每个变量只赋值一次的中间表示
典型场景：编译优化、寄存器分配
它不是什么：不是常量传播（SSA 是形式，常量传播是优化）

术语：污点分析 (Taint Analysis)
一句话定义：标记不可信输入，追踪其传播路径
典型场景：安全漏洞检测（SQL 注入、XSS）
它不是什么：不是类型推断（污点是安全分析，类型推断是语义分析）

术语：LLM-as-a-Judge
一句话定义：用大模型评估生成内容的质量
典型场景：代码评测、对话质量打分
它不是什么：不是单元测试（LLM 是概率评估，测试是确定性验证）

术语：测试覆盖率 (Code Coverage)
一句话定义：测试用例执行到的代码比例
典型场景：行覆盖率、分支覆盖率、路径覆盖率
它不是什么：不是质量保证（覆盖率高不代表质量高）

术语：Fuzzing (模糊测试)
一句话定义：自动生成随机或半随机输入，触发程序异常
典型场景：漏洞挖掘、崩溃复现
它不是什么：不是单元测试（fuzzing 是盲测，单元测试是白盒）

术语：插桩 (Instrumentation)
一句话定义：在代码中插入探针，收集运行时信息
典型场景：性能分析、覆盖率统计
它不是什么：不是打日志（插桩是自动生成，日志是手动编写）

术语：符号表 (Symbol Table)
一句话定义：记录变量名、函数名与其语义信息的映射
典型场景：作用域解析、类型检查
它不是什么：不是 AST（符号表是字典，AST 是树）
```

---

### 知识地形图

```
           [高价值+高频] → 核心区（深度学习）
                  │
  ┌───────────────┼───────────────┐
  │               │               │
共享内存          JVM调优          AST分析
零拷贝            Reactor模式      符号执行
对象池            gRPC            污点分析
                  │               │
  [低价值+高频] ──┼── [高价值+低频] → 深入区（理解原理）
  │               │               │
WebSocket         服务网格         编译优化
JNI               灰度发布         SSA
                  │               │
           [低价值+低频] → 查阅区（用到了再搜）
                  │
              eBPF（可选）
              K8s 运维（外包）
              前端开发（无关）
```

---

## 按层级拆解的技术路线

### 三轨道并行学习策略

```
┌────────────────────────────────────────────────────────┐
│          3 个月学习计划（每周 10 小时）                 │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Month 1: 基础层（Level 1）                            │
│  ├─ C++: 内存管理、智能指针、STL                      │
│  ├─ Java: JVM、多线程、NIO                            │
│  └─ AI评测: 编译原理基础、AST 入门                    │
│                                                        │
│  Month 2: 桥接层（Level 2）                            │
│  ├─ C++-Java: JNI 优化、共享内存、零拷贝              │
│  ├─ Java: Spring Cloud、微服务架构                    │
│  └─ C++: CUDA 基础、模型推理引擎                      │
│                                                        │
│  Month 3: 应用层（Level 3）                            │
│  ├─ AI评测: 静态分析、fuzzing、LLM-as-a-Judge        │
│  ├─ 完整集成: 端到端性能优化                          │
│  └─ 生产化: 监控、日志、故障诊断                      │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

### 轨道 1: C++ 底层引擎（40 小时）

#### Level 1: C++ 基础与内存管理（12 小时）
**目标**：掌握现代 C++ 的内存管理和并发编程

**学习资源**：
- 📖 《Effective C++》第 4、7 章
- 🎥 [C++ Memory Model -CppCon](https://www.youtube.com/results?search_query=cpp+memory+model)
- 💻 实验：[CppConcurrencyInAction](https://github.com/andy-sem/atlfm)

**任务清单**：
- [ ] **任务1.1**：实现一个智能指针类（8 小时）
  - 实现 `unique_ptr`、`shared_ptr`、`weak_ptr`
  - 支持自定义删除器
  - 通过单元测试（用 Catch2 框架）
  - **检查点**：能解释引用计数的线程安全问题

- [ ] **任务1.2**：实现一个线程安全对象池（4 小时）
  - 使用 `std::mutex` + 条件变量
  - 支持对象获取、归还、超时
  - **检查点**：能画出对象池的状态机

**输出物**：
- 代码：`cpp-engine/memory/pool.{h,cpp}`
- 文档：`docs/object-pool-design.md`
- 测试：`cpp-engine/test/pool_test.cpp`

---

#### Level 2: 高性能通信机制（16 小时）
**目标**：实现 Java 与 C++ 的零拷贝通信

**学习资源**：
- 📖 《Linux高性能服务器编程》第 5、9 章
- 📄 [Shared Memory in C++](https://man7.org/linux/man-pages/man7/shm_overview.7.html)
- 💻 实验：[boost::interprocess](https://www.boost.org/doc/libs/release/doc/html/interprocess.html)

**任务清单**：
- [ ] **任务2.1**：实现共享内存通信（8 小时）
  - C++ 端：`shm_server.{h,cpp}`（写入数据）
  - C++ 端：`shm_client.{h,cpp}`（读取数据）
  - 使用信号量同步
  - **检查点**：用 `strace` 验证无 `read/write` 系统调用

- [ ] **任务2.2**：实现 JNI 桥接层（8 小时）
  - Java API：`NativeBridge.java`
  - C++ 实现：`native_bridge.cpp`
  - 支持三种模式：
    1. 普通 JNI（基准）
    2. 共享内存 JNI（优化）
    3. 零拷贝 JNI（极致优化）
  - **检查点**：用 JMH 基准测试，三种模式性能对比

**输出物**：
- 代码：`cpp-engine/jni/`, `java-module/native/`
- 性能报告：`docs/jni-benchmark.md`
- 对比图表：三种模式的延迟/吞吐量对比

---

#### Level 3: CUDA 推理引擎（12 小时）
**目标**：封装基础模型推理能力

**学习资源**：
- 📖 [CUDA C Programming Guide](https://docs.nvidia.com/cuda/cuda-c-programming-guide/) 第 3、6 章
- 🎥 [CUDA Best Practices](https://www.youtube.com/watch?v=Ju1y8pDKzIk)
- 💻 实验：[TensorRT C++ API](https://github.com/NVIDIA/TensorRT)

**任务清单**：
- [ ] **任务3.1**：实现简单的 CUDA kernel（4 小时）
  - 矩阵乘法：`mat_mul.cu`
  - 使用共享内存优化
  - **检查点**：用 `nvprof` 分析，达到 80% 的理论峰值

- [ ] **任务3.2**：封装推理引擎接口（8 小时）
  - 抽象接口：`InferenceEngine{.h,.cpp}`
  - 支持模型加载、推理、释放
  - 集成 TensorRT（可选，或用 dummy 实现）
  - **检查点**：能处理 1000 QPS 的推理请求

**输出物**：
- 代码：`cpp-engine/inference/`
- 性能报告：`docs/cuda-benchmark.md`
- 火焰图：`cpp-engine/profile/flamegraph.svg`

---

### 轨道 2: Java 微服务层（40 小时）

#### Level 1: JVM 与并发基础（12 小时）
**目标**：理解 JVM 内存模型和 Java 并发机制

**学习资源**：
- 📖 《深入理解 Java 虚拟机》第 2、5 章
- 🎥 [JVM Internals - JFokus](https://www.youtube.com/watch?v=Yv0kEQv9Trg)
- 💻 实验：[Java Concurrency in Practice](https://github.com/jcip/jcip)

**任务清单**：
- [ ] **任务1.1**：实现一个无锁队列（8 小时）
  - 使用 `AtomicReference` + CAS
  - 实现 `LockFreeQueue<T>`
  - **检查点**：通过 JMH 基准测试，性能优于 `LinkedBlockingQueue`

- [ ] **任务1.2**：JVM 堆外内存实践（4 小时）
  - 使用 `ByteBuffer.allocateDirect()`
  - 对比堆内 vs 堆外内存性能
  - **检查点**：能用 VisualVM 观察堆外内存使用

**输出物**：
- 代码：`java-module/concurrent/`
- 性能报告：`docs/jvm-off-heap.md`

---

#### Level 2: Spring Cloud 微服务（16 小时）
**目标**：搭建高可用的微服务架构

**学习资源**：
- 📖 《Spring Cloud 微服务实战》第 3、6 章
- 📄 [Spring Cloud Alibaba](https://github.com/alibaba/spring-cloud-alibaba)
- 💻 实验：[Spring Cloud Samples](https://github.com/spring-cloud-samples)

**任务清单**：
- [ ] **任务2.1**：搭建基础微服务（8 小时）
  - 服务注册：Nacos
  - 服务调用：OpenFeign
  - 网关：Spring Cloud Gateway
  - **检查点**：两个服务能互相调用，网关能路由

- [ ] **任务2.2**：实现熔断限流（8 小时）
  - 集成 Sentinel
  - 配置熔断规则（QPS > 1000 时熔断）
  - 配置限流规则（单机 QPS < 500）
  - **检查点**：用 JMeter 压测，验证熔断和限流生效

**输出物**：
- 代码：`java-module/microservice/`
- 配置：`java-module/config/sentinel-rules.json`
- 架构图：`docs/microservice-architecture.svg`

---

#### Level 3: WebSocket 与实时通信（12 小时）
**目标**：支持推理任务的实时推送

**学习资源**：
- 📖 《Netty 实战》第 12 章
- 📄 [Spring WebSocket](https://docs.spring.io/spring-framework/reference/web/websocket.html)
- 💻 实验：[WebSocket Demo](https://github.com/netty/netty/wiki)

**任务清单**：
- [ ] **任务3.1**：实现 WebSocket 服务（8 小时）
  - 基于 Netty
  - 支持心跳检测
  - 支持消息推送
  - **检查点**：10 个并发连接，消息延迟 < 10ms

- [ ] **任务3.2**：集成推理任务（4 小时）
  - Java 接收推理请求
  - 通过 JNI 调用 C++ 引擎
  - 结果通过 WebSocket 推送
  - **检查点**：端到端延迟 < 100ms

**输出物**：
- 代码：`java-module/websocket/`
- 测试脚本：`java-module/test/websocket_load_test.py`

---

### 轨道 3: AI 代码评测系统（40 小时）

#### Level 1: 编译原理与 AST（12 小时）
**目标**：理解代码分析的基础

**学习资源**：
- 📖 《编译原理》第 4 章（语法分析）
- 🎥 [Crafting Interpreters](https://www.youtube.com/playlist?list=PLZQftyCk7_SdoVexSmwy_tBgs7Q0bQyGJ)
- 💻 实验：[ANTLR4 Tutorial](https://www.antlr.org/)

**任务清单**：
- [ ] **任务1.1**：实现简单语言的解析器（8 小时）
  - 语言：支持变量、赋值、if/else、while
  - 工具：ANTLR4
  - 输出：AST（JSON 格式）
  - **检查点**：能解析 5 种常见语法错误

- [ ] **任务1.2**：AST 可视化（4 小时）
  - 用 Graphviz 生成 AST 树
  - 高亮关键节点（变量赋值、函数调用）
  - **检查点**：能识别代码中的所有变量引用

**输出物**：
- 代码：`ai-eval/parser/`
- 语法文件：`ai-eval/grammar/SimpleLang.g4`
- 可视化工具：`ai-eval/viz/ast_viewer.py`

---

#### Level 2: 静态分析与安全检测（16 小时）
**目标**：实现基础的代码质量检测

**学习资源**：
- 📖 《静态程序分析》第 2、4 章
- 📄 [Infer Static Analyzer](https://fbinfer.com/)
- 💻 实验：[CodeQL](https://codeql.github.com/)

**任务清单**：
- [ ] **任务2.1**：实现数据流分析（8 小时）
  - 分析变量定义-使用链（def-use chain）
  - 检测未初始化变量
  - **检查点**：能检测出 5 种常见 bug

- [ ] **任务2.2**：实现污点分析（8 小时）
  - 标记用户输入（`scanf`、`read`）
  - 追踪污点传播（赋值、函数调用）
  - 检测危险函数调用（`system`、`exec`）
  - **检查点**：能检测出 SQL 注入、命令注入

**输出物**：
- 代码：`ai-eval/static_analysis/`
- 规则库：`ai-eval/rules/security_patterns.json`
- 测试用例：`ai-eval/test/vulnerabilities/`

---

#### Level 3: LLM-as-a-Judge 与自动化测试（12 小时）
**目标**：集成大模型进行代码质量评测

**学习资源**：
- 📄 [LLM-as-a-Judge Survey](https://arxiv.org/abs/2306.05685)
- 📄 [OpenAI Evals](https://github.com/openai/evals)
- 💻 实验：[Prompt Engineering Guide](https://www.promptingguide.ai/)

**任务清单**：
- [ ] **任务3.1**：设计评测 Prompt（4 小时）
  - 角色设定："你是一个资深 C++ 专家"
  - 评测维度：正确性、性能、安全性、可读性
  - 输出格式：JSON（评分 + 理由 + 建议）
  - **检查点**：Prompt 能让 LLM 给出结构化反馈

- [ ] **任务3.2**：实现评测流水线（8 小时）
  - 输入：LLM 生成的 C++ 代码
  - 步骤：
    1. AST 提取特征
    2. 静态分析（检测 bug）
    3. LLM 评测（质量打分）
    4. 单元测试生成
    5. 动态执行
  - **检查点**：能对 10 个代码样本给出评测报告

**输出物**：
- 代码：`ai-eval/llm_judge/`
- Prompt 模板：`ai-eval/prompts/code_review.txt`
- 评测报告示例：`ai-eval/report/sample_eval.json`

---

## 第2阶段：建立信号通路

### 最小 I/O 系统

```
┌──────────────────────────────────────────────────────────┐
│  完整数据流：HTTP 请求 → Java → C++ → GPU → 结果返回    │
└──────────────────────────────────────────────────────────┘

输入：HTTP POST /api/inference
{
  "model_id": "gpt-3.5",
  "prompt": "写一个快速排序",
  "max_tokens": 1000
}

输出：HTTP Response
{
  "generated_code": "void quicksort(...)",
  "quality_report": {
    "correctness": 0.85,
    "security_issues": ["未检查边界"],
    "performance_score": 0.72
  }
}
```

### Hello World 级别 Demo

**Week 1 目标**：
```bash
# 1. 启动 C++ 引擎
$ ./cpp-engine/build/inference_server --port 8081

# 2. 启动 Java 微服务
$ cd java-module && mvn spring-boot:run

# 3. 发送测试请求
$ curl -X POST http://localhost:8080/api/inference \
  -H "Content-Type: application/json" \
  -d '{"model": "test", "input": "Hello"}'

# 预期输出：
{"result": "processed: Hello", "latency_ms": 45}
```

---

## 第3阶段：解调分析（核心机制）

### 元模型示例

**为什么用共享内存？**
```
为什么需要高性能通信？
→ 因为 JNI 调用有开销（参数序列化、JVM 奔溃检查）
  → 为什么不能优化 JNI？
    → 因为 JNI 需要在 Java 和 C++ 之间拷贝数据
      → 为什么需要拷贝？
        → 因为 Java 堆内存和 C++ 堆内存不共享
          → **元模型**：跨语言通信的核心问题是**内存空间的隔离**
```

**最小可行性类比**：
```
概念           生活类比              验证
─────────────────────────────────────────────
共享内存       两个人在一张白板上   ✅ 不需要传递
               同时写字，无需递纸条

消息队列       传送带               ✅ 有缓冲、有顺序

熔断器         电路保险丝           ✅ 过载自动跳闸

AST            句子的语法树         ✅ 主谓宾结构
               (我 爱 编程)
```

---

## 第4阶段：破坏测试与边界探索

### 异常场景矩阵

```
         正常场景        非正常场景        极端场景
─────────────────────────────────────────────────────
输入层    标准 JSON       空值/超大payload   恶意构造(GB级)
C++层     正常推理        GPU OOM          显存泄漏
Java层    200响应         JVM OOM          Full GC 频繁
网络层    <10ms延迟       网络抖动         连接断开
评测层    正常代码        语法错误         恶意代码(挖矿)
```

### 破坏测试示例

**Level 1：单点破坏**
- [ ] 输入为空字符串 → C++ 是否崩溃？
- [ ] C++ 推理超时（无响应）→ Java 是否感知？
- [ ] GPU 内存不足 → 是否优雅降级？

**Level 2：组合破坏**
- [ ] [高 QPS] + [大模型] = 内存溢出？
- [ ] [网络慢] + [超时短] = 雪崩？
- [ ] [恶意代码] + [动态执行] = 逃逸？

**Level 3：压力破坏**
- [ ] 10000 QPS 持续 10 分钟 → 内存泄漏？
- [ ] 内存限制到 1GB → 何时 OOM？
- [ ] GPU 带宽减半 → 性能下降曲线？

---

## 第5-6阶段：校验与长期记忆

### 费曼技巧检查清单

**给大一新生讲"为什么用共享内存"**：
```
❌ "共享内存通过 mmap 系统调用将同一块物理内存映射到多个进程的虚拟地址空间..."

✅ "想象你在办公室，要给同事传文件。
   传统方法：你打印 → 走到同事工位 → 递给他（相当于 Socket 拷贝）
   共享内存：你们共用一个白板，你写完他直接看（零拷贝）
```

### 极端假设游戏

- [ ] 如果输入扩大 1000 倍（1GB 文本），哪里先崩？
  - **预期**：Java 堆内存 OOM → 解决：流式处理
- [ ] 如果 GPU 突然断电，系统会怎样？
  - **预期**：C++ 崩溃 → Java 感知连接断开 → 返回错误
- [ ] 如果 LLM 返回恶意代码（挖矿程序），能检测到吗？
  - **预期**：静态分析检测到 `system()` 调用 → 拦截

### 认知索引卡（示例）

```
┌─────────────────────────────────────────────┐
│ 概念：共享内存 (Shared Memory)              │
├─────────────────────────────────────────────┤
│ 一句话：多个进程访问同一块物理内存，无需拷贝 │
├─────────────────────────────────────────────┤
│ 本质：打破进程隔离，让内存成为共享资源       │
├─────────────────────────────────────────────┤
│ 典型场景：Java-C++ 高速通信、缓存           │
├─────────────────────────────────────────────┤
│ 它不是什么：不是消息队列（无拷贝 vs 有拷贝）│
├─────────────────────────────────────────────┤
│ Trade-off：性能 ↑ vs 复杂度 ↑ vs 安全性 ↓  │
├─────────────────────────────────────────────┤
│ 何时不用：数据量小（<1KB）、不需要共享      │
├─────────────────────────────────────────────┤
│ 类比：两个人共用一张白板，无需递纸条        │
└─────────────────────────────────────────────┘
```

---

## 📊 学习进度跟踪表

### 3 个月计划（每周检查）

| 周次 | C++ 轨道 | Java 轨道 | AI 评测 | 集成 | 状态 |
|------|----------|-----------|---------|------|------|
| W1   | 智能指针  | JVM基础   | -       | -    | ⏸️  |
| W2   | 对象池    | 并发      | -       | -    | ⏸️  |
| W3   | 共享内存  | Spring    | -       | -    | ⏸️  |
| W4   | JNI       | 微服务    | -       | -    | ⏸️  |
| W5   | CUDA      | WebSocket| -       | -    | ⏸️  |
| W6   | 推理引擎  | 熔断限流  | -       | -    | ⏸️  |
| W7   | -         | -        | AST     | -    | ⏸️  |
| W8   | -         | -        | 静态分析| -    | ⏸️  |
| W9   | -         | -        | LLM评测 | -    | ⏸️  |
| W10  | -         | -        | Fuzzing | -    | ⏸️  |
| W11  | 优化      | 优化      | 优化    | 集成 | ⏸️  |
| W12  | 文档      | 文档      | 文档    | 部署 | ⏸️  |

---

## 🎯 关键里程碑

### Month 1 结束
- [ ] 能运行 C++ 推理引擎（单模型、单请求）
- [ ] 能搭建 Spring Cloud 基础微服务
- [ ] 能解析简单代码并生成 AST

### Month 2 结束
- [ ] Java 能通过共享内存调用 C++
- [ ] 推理引擎集成 TensorRT/CUDA
- [ ] 静态分析能检测 5 种常见 bug

### Month 3 结束
- [ ] 端到端系统上线（Docker 部署）
- [ ] 代码评测流水线能自动化评分
- [ ] 性能达标：QPS > 1000, P99 < 100ms

---

## 📚 参考资源汇总

### 在线课程
- [C++ Concurrency - Udemy](https://www.udemy.com/course/cpp-concurrency-in-depth/)
- [Spring Cloud Microservices - Baeldung](https://www.baeldung.com/spring-cloud-series)
- [Compiler Design - NPTEL](https://www.youtube.com/playlist?list=PLB03A39EA2828AC30)

### 开源项目
- [Triton Inference Server](https://github.com/triton-inference-server/server) - NVIDIA 推理服务
- [FASTAPI](https://github.com/tiangolo/fastapi) - 高性能 API 框架
- [Infer](https://github.com/facebook/infer) - Facebook 静态分析工具

### 论文
- [LLM-as-a-Judge](https://arxiv.org/abs/2306.05685) - 评测方法论
- [TensorRT: High-Performance Deep Learning Inference](https://arxiv.org/abs/1908.08944)
- [SVO: Static Single Assignment Form](https://dl.acm.org/doi/10.1145/647481.757540)

---

## ✅ 执行建议

### 每日学习流程（2 小时）
1. **15 分钟**：复习昨天的认知索引卡
2. **60 分钟**：执行当前任务（写代码、看视频）
3. **30 分钟**：记录学习笔记（更新黑话词典、知识地图）
4. **15 分钟**：规划明天的任务

### 每周检查点
- [ ] 能否用一句话解释本周学到的核心概念？
- [ ] 能否画出本周实现的系统架构图？
- [ ] 能否通过破坏测试验证本周代码？

### 应对卡壳
- **第 1 层卡壳**（概念不懂）→ 回到第 1 阶段，重新压缩编码
- **第 2 层卡壳**（代码跑不通）→ 回到第 2 阶段，简化到最小 Demo
- **第 3 层卡壳**（性能不达标）→ 回到第 4 阶段，破坏性测试找瓶颈

---

## 🚀 开始行动

### 立即执行（今天就做）
1. [ ] 创建项目目录：
   ```bash
   mkdir -p ai-serving-mesh/{cpp-engine,java-module,ai-eval,docs}
   ```
2. [ ] 安装基础工具：
   ```bash
   # C++
   brew install cmake llvm

   # Java
   brew install openjdk@17 maven

   # AI 评测
   pip install antlr4-python3-runtime
   ```
3. [ ] 克隆参考项目：
   ```bash
   git clone https://github.com/NVIDIA/TensorRT src/reference/TensorRT
   ```

### 第一周目标
- [ ] 完成 C++ 智能指针实现（任务1.1）
- [ ] 读完《Effective C++》第 4 章
- [ ] 能画出共享内存 vs Socket 的对比图

---

**记住**：你觉得自己理解了，只有在输出时卡壳的那一刻，才知道其实没懂。而卡壳的地方，就是真正需要下功夫的地方。

**开始时间**：2026-01-09
**预计完成**：2026-04-09（3 个月）
**当前状态**：📍 第 0 阶段 - 目标锚定

---

*生成时间：2026-01-09*
*基于 master-complex-domain skill v1.0*
