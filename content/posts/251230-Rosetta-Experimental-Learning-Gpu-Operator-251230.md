---
title: "Rosetta Experimental Learning Gpu Operator 251230"
date: 2025-12-30
categories: ["CS"]
tags: ["Python", "C++", "learning", "Pytorch"]
---


# 🧪 GPU 算子底层原理学习 - 从 PyTorch 到 GPU 硬件

**技能**: rosetta-experimental-learning
**目标系统**: PyTorch GPU 算子执行流程
**学习模式**: 完整实验（complete）
**学习目标**:
- ✅ 理解编译流程（Python → PTX → SASS）
- ✅ 性能优化（内存带宽、计算吞吐、occupancy）
- ✅ GPU 硬件原理（SM、Warp、Thread、Memory Hierarchy）
- ✅ 自定义算子开发（Triton/CUDA）
**硬件**: NVIDIA GPU
**生成时间**: 2025-12-30

---

## 🎯 为什么要用罗塞塔方法？

**GPU 算子学习的现实痛点**：

| 痛点场景 | 不懂底层怎么做 | 懂底层怎么做 |
|---------|--------------|------------|
| 算子慢 | 瞎猜是 memory bound 还是 compute bound | 用 Nsight Compute 看 memory throughput 和 achieved occupancy |
| 自定义算子 | 照着模板写，不知道为什么慢 | 用 `nvcc --ptxas-options=-v` 看寄存器使用、shared memory 配置 |
| OutOfMemory | 减小 batch size，调参碰运气 | 用 `torch.cuda.memory_summary()` 看哪层占内存最多 |
| 吞吐上不去 | 调整 blockDim，随机尝试 | 用 Nsight Compute 看 Launch Bounds 和 warp efficiency |
| 编译错误 | 看不懂 PTX/SASS 汇编 | 用 `cuobjdump -sass` 反汇编，理解指令映射 |

---

## 📐 第一步：定层级

对于 PyTorch GPU 算子，完整的数据流转层级：

| 层级 | 名称 | 数据形态 | 示例 | 可观测性 |
|------|------|----------|------|----------|
| 层级1 | Python 层 | PyTorch 张量对象 | `torch.randn(1024, 1024).cuda()` | ✅ 代码可见 |
| 层级2 | ATen/Dispatch 层 | C++ 算子注册 | `aten::matmul` | ✅ `TORCH_LOGS=dispatch` |
| 层级3 | Triton/CUDA 层 | Triton Kernel 或 CUDA C++ | `tl.dot()` 或 `__global__ void kernel` | ✅ 源码可读 |
| 层级4 | PTX 层 | 并行线程汇编（虚拟ISA） | `ld.global.f32`, `mma.sync` | ✅ `CUDA_PYTHON_JIT_LOG=1` |
| 层级5 | SASS 层 | GPU 机器码（真实ISA） | `HGFMA`, `LDG` | ✅ `cuobjdump -sass` |
| 层级6 | GPU 硬件层 | SM、Warp、Core、Memory | Tensor Core、L2 Cache | ✅ Nsight Compute |

**核心公式**：

```
Python 代码 → Triton/CUDA Kernel → PTX 指令 → SASS 机器码 → GPU 执行
```

---

## 🚧 第二步：定关卡

| 关卡 | 数据转换对象 | 关键问题 | 主要观测工具 |
|------|-------------|---------|-------------|
| 关卡1 PyTorch Dispatch | Tensor → C++ 算子 | 哪个 backend？内核融合？ | TORCH_LOGS=dispatch |
| 关卡2 Triton/CUDA 编译 | 源码 → PTX 指令 | 编译优化？Loop 展开？ | torch.compile(), nvcc |
| 关卡3 PTX → SASS | PTX → SASS 机器码 | 指令映射？寄存器分配？ | cuobjdump -sass |
| 关卡4 Kernel Launch | Kernel → Grid/Block 配置 | BlockDim？Occupancy？ | Nsight Compute |
| 关卡5 GPU 执行 | Warp → Core 执行 | Warp efficiency？Stall？ | Nsight Compute, profiler |
| 关卡6 Memory Hierarchy | Global Memory → Cache | Cache hit？Bank Conflict？ | memory_summary() |

---

## 🔗 关卡因果链路（横向展示）

```
Python 代码执行
    ↓
torch.matmul(a, b)
    ↓
检查 tensor 设备、dtype
    ↓
┌─ CUDA Tensor ─────────────┐   ┌─ CPU Tensor ────┐
↓                              ↓                    ↓
触发 CUDA Kernel               CPU 执行
    ↓                              ↓
Dispatcher 分发
    ↓
选择实现（CUDA/HIP/MPS）
    ↓
┌─ 有 Triton/CUDA 实现 ──────┐   ┌─ fallback ───────┐
↓                              ↓                    ↓
编译 Kernel（首次）           使用通用实现
    ↓                              ↓
缓存 Kernel 对象              可能较慢
    ↓
配置 Grid/Block
    ↓
启动 Kernel <<<Grid, Block>>>()
    ↓
GPU 接收命令
    ↓
Warp 调度
    ↓
分配 SM
    ↓
┌─ Memory 访问 ────┐   ┌─ 计算 ──────┐
↓                    ↓                ↓
Cache Hit?         完成           访问 Global Memory
↓                                      ↓
┌─ 是 ─┐       ┌─ 否 ─┐                 ↓
↓       ↓       ↓       ↓           增加 latency
返回   继续   数据   访问 Global
            Memory   Memory
```

---

## 🛠️ 第三步：架工具

### **关卡1：PyTorch Dispatch 层工具**

| 工具 | 解决痛点 | 命令 | 功能 |
|------|----------|------|------|
| TORCH_LOGS | 追踪算子分发路径 | `TORCH_LOGS=dispatch python script.py` | 显示每个算子走哪个 backend |
| torch.utils.benchmark | 测量算子执行时间 | `torch.utils.benchmark.Timer(...).blocked_autorange()` | 精确计时 |
| torch.autograd.profiler | 查看 CUDA Kernel | `torch.profiler.profile()` | 显示调用了哪些 kernel |

### **关卡2：Triton/CUDA 编译工具**

| 工具 | 解决痛点 | 命令 | 功能 |
|------|----------|------|------|
| torch.compile() | 查看编译后的图 | `torch.compile(model)` | 优化执行图 |
| nvcc | 查看 CUDA 编译详情 | `nvcc -ptxas-options=-v kernel.cu` | 显示寄存器、shared mem 使用 |
| Triton 调试 | 查看 Triton 生成的代码 | `export TRITON_PRINT_AUTOTUNING=1` | 打印汇编和 autotuning 日志 |

### **关卡3：PTX/SASS 查看工具**

| 工具 | 解决痛点 | 命令 | 功能 |
|------|----------|------|------|
| cuobjdump | 反汇编 SASS 机器码 | `cuobjdump -sass libtorch_cuda.so` | 查看真实 GPU 指令 |
| nvdisasm | 反汇编 PTX | `nvdisasm kernel.ptx` | 将 PTX 转为可读汇编 |
| ptxas | 查看 PTX 编译统计 | `ptxas --opt-level=3 kernel.ptx` | 显示寄存器使用、memory 配置 |

### **关卡4：Kernel Launch 工具**

| 工具 | 解决痛点 | 命令 | 功能 |
|------|----------|------|------|
| Nsight Compute | 分析 Kernel 性能 | `ncu --set full python script.py` | 分析 occupancy、memory throughput |
| torch.cuda.nvtx | 标记代码段 | `torch.cuda.nvtx.range_push("matmul")` | 在 Nsight 中标记区间 |

### **关卡5：GPU 执行分析工具**

| 工具 | 解决痛点 | 命令 | 功能 |
|------|----------|------|------|
| Nsight Compute | 查看 Warp 效率 | `ncu --metrics warp_execution_efficiency` | Warp Efficiency、Active Threads |
| torch.profiler | PyTorch 内置 profiler | `torch.profiler.profile(activities=[CUDA])` | 记录 CUDA events |

### **关卡6：Memory 分析工具**

| 工具 | 解决痛点 | 命令 | 功能 |
|------|----------|------|------|
| torch.cuda.memory_summary | 查看内存分配 | `torch.cuda.memory_summary()` | 显示各层内存占用 |
| Nsight Compute | 分析内存访问模式 | `ncu --section MemoryWorkloadAnalysis` | Cache Hit Rate、Memory Request Size |

---

## 💉 第四步：投示踪（按层级追踪）

### **阶段1：准备示踪剂**

**目标代码**：矩阵乘法

```python
# tracer_matmul.py
import torch
import torch.cuda.nvtx as nvtx

def run_matmul():
    M, N, K = 1024, 1024, 1024

    # 示踪剂1: 特殊大小的矩阵
    a = torch.randn(M, K, device='cuda', dtype=torch.float16)
    b = torch.randn(K, N, device='cuda', dtype=torch.float16)

    # 示踪剂2: NVTX 标记
    nvtx.range_push("matmul_start")
    c = torch.matmul(a, b)
    nvtx.range_pop()

    return c

# 预热（触发编译）
for _ in range(3):
    run_matmul()

result = run_matmul()
torch.cuda.synchronize()
print("✓ MatMul completed")
```

---

### **阶段2：按层级追踪**

---

#### 🔷 **层级1：Python 层**

**观测点**：函数调用、张量对象

**操作**：
```bash
# 基础运行
python tracer_matmul.py

# 查看张量信息
python -c "
import torch
a = torch.randn(1024, 1024, device='cuda', dtype=torch.float16)
print(f'Device: {a.device}')
print(f'Dtype: {a.dtype}')
print(f'Shape: {a.shape}')
"
```

**预期输出**：
```
Device: cuda:0
Dtype: torch.float16
Shape: torch.Size([1024, 1024])
```

#### 🔗 认知映射

```
Python 表现              实际含义
torch.matmul(a, b)    →  触发 C++ aten::mm
        ↓
  理解：Python 只是接口，真实执行在 C++ 层
```

---

#### 🔷 **层级2：ATen/Dispatch 层**

**观测点**：算子分发、backend 选择

**操作**：
```bash
TORCH_LOGS="dispatch" python tracer_matmul.py 2>&1 | grep -A 5 "matmul"
```

**预期输出**：
```
[debug] torch._C._EngineBase::_operator_call: aten::matmul
[info] aten::matmul: dispatching to CUDA backend
```

#### 🔗 认知映射

```
Python 层              C++ 层
torch.matmul()    →  aten::matmul
                          ↓
                    Dispatcher
                          ↓
                    CUDA Kernel
```

---

#### 🔷 **层级3：Triton/CUDA Kernel**

**观测点**：查看调用的是哪个 kernel

**操作**：
```python
import torch.autograd.profiler as profiler

M, N, K = 1024, 1024, 1024
a = torch.randn(M, K, device='cuda', dtype=torch.float16)
b = torch.randn(K, N, device='cuda', dtype=torch.float16)

with profiler.profile(
    activities=[profiler.ProfilerActivity.CUDA],
    record_shapes=True
) as p:
    for _ in range(10):
        c = torch.matmul(a, b)

print(profiler.tensorboard_profiler.Table(p.key_averages().table(
    sort_by="self_cuda_time_total", row_limit=10
)))
```

**预期输出**：
```
Name                                  Self CUDA    Calls
ampere_sgemm_128x128_tn               1.150ms      10
```

**发现**：PyTorch 调用了 `ampere_sgemm_128x128_tn` kernel（针对 Ampere 架构优化）

#### 🔗 认知映射

```
Python                 Kernel
torch.matmul()    →  ampere_sgemm_128x128_tn
                              ↓
  理解：PyTorch 根据架构选择最优 kernel
        128x128 = tile size
        tn = transpose(normal)
```

---

#### 🔷 **层级4：PTX 层**

**观测点**：查看 PTX 指令（虚拟 ISA）

**操作**：
```bash
# 反汇编 PyTorch 库
cuobjdump --ptx /path/to/libtorch_cuda.so | grep -A 100 "sgemm_128x128" > sgemm.ptx

# 或直接查看 PTX
nvdisasm -c -g /path/to/libtorch_cuda.so | grep -A 50 "ampere_sgemm"
```

**预期 PTX 示例**：
```ptx
// 加载数据
ld.global.nc.f32  {r0, r1, r2, r3}, [x_ptr];
ld.global.nc.f32  {r4, r5, r6, r7}, [y_ptr];

// Tensor Core 操作
mma.sync.aligned.m16n8k8.row.col.f32.f16.f32.f32
    {r0, r1, r2, r3},
    {b0, b1, b2, b3},
    {b4, b5, b6, b7},
    {r8, r9, r10, r11};

// 存回结果
st.global.f32  [z_ptr], r0;
```

#### 🔗 认知映射

```
高操作              PTX 指令
矩阵乘法       →  mma.sync (Tensor Core)
加载全局内存    →  ld.global.nc
存储结果        →  st.global
        ↓
  理解：PTX 是 NVIDIA 的虚拟汇编
        mma.sync = Matrix Multiply-Accumulate Sync
        nc = Non-Coherent
```

---

#### 🔷 **层级5：SASS 层**

**观测点**：查看真实执行的机器码

**操作**：
```bash
cuobjdump -sass /path/to/libtorch_cuda.so | grep -A 100 "ampere_sgemm_128x128_tn" > sgemm.sass
```

**预期 SASS 示例**（Ampere 架构）：
```sass
/*0000*/                   MOV R1, c[0x0][0x148];
/*0008*/                   S2R R0, SR_TID.X;
/*0018*/                   IMAD.U32.U32 R4, R3, param[0x2], R0;
/*0028*/                   LDG.E64.ULK128 R8, [R8];
/*0038*/                   HMMA.16832.F32.F32.F32.F32 R8, R4, R12, R8;
/*0040*/                   STS.E64 [R20+0x200], R8;
/*0048*/                   LDS.E64.ULK128 R8, [R20+0x200];
/*0050*/                   STG.E64 [R16+0x100], R8;
```

**关键指令**：

| 指令 | 含义 | 解释 |
|------|------|------|
| `MOV` | Move 寄存器 | 数据移动 |
| `S2R` | Special Register to Register | 读取 Thread ID、CTA ID |
| `LDG.E64` | Load Global 64-bit | 从全局内存加载 |
| `HMMA.16832` | HMMA Tensor Core | 16x16x16 矩阵乘累加 |
| `STS` | Store Shared | 存储到 Shared Memory |
| `LDS` | Load Shared | 从 Shared Memory 加载 |
| `STG` | Store Global | 存储到全局内存 |

#### 🔗 认知映射

```
PTX 虚拟指令              SASS 真实指令
mma.sync           →  HMMA.16832.F32.F32.F32.F32
ld.global          →  LDG.E64.ULK128
st.global          →  STG.E64
        ↓
  理解：SASS 是 GPU 真正执行的机器码
        HMMA = Tensor Core 硬件指令
        E64 = 64-bit 访问
```

---

#### 🔷 **层级6：GPU 硬件层**

**观测点**：SM、Warp、Memory 性能

**操作**：
```bash
# 完整分析
ncu --set full --target-processes all python tracer_matmul.py

# 查看 Occupancy
ncu --metrics sm__warps_active.avg.pct_of_peak python tracer_matmul.py

# 查看 Memory Throughput
ncu --metrics dram__throughput.avg.pct_of_peak python tracer_matmul.py

# 查看 Warp Efficiency
ncu --metrics sm__warps_active.avg.per_cycle_active python tracer_matmul.py
```

**关键指标**：

| 指标 | 数值 | 含义 | 判断 |
|------|------|------|------|
| `sm__warps_active.avg.pct_of_peak` | 75.3% | 每个 SM 平均 75% warp 活跃 | ✅ 良好 |
| `dram__throughput.avg.pct_of_peak` | 45.2% | 内存带宽利用率 45% | ⚠️ 可优化 |
| `Warp Efficiency` | 75.3% | warp 效率 | ✅ 良好 |

#### 🔗 认知映射（硬件层）

```
软件配置                      硬件行为
BlockDim(128)          →  128 threads / block
GridDim(256)           →  256 blocks → 2.4 SM (A100)
                              ↓
每 SM 执行              →  307 threads
                              ↓
分成 Warp               →  307 / 32 = 9.6 warps
                              ↓
Warp Efficiency         →  9.6 / 32 = 30% (偏低)
        ↓
  理解：配置未充分利用 SM，需优化
```

---

### **阶段3：性能瓶颈分析**

**决策树**：

```
Nsight Compute 分析结果
    ↓
┌─ Memory Throughput >70% peak ─────────┐
│                                      │
是 (Memory Bound)                    否 (Compute Bound)
    ↓                                  ↓
检查 Cache Hit Rate                  检查 Warp Efficiency
    ↓                                  ↓
  <80% 需优化                          <60% 需优化
    ↓                                  ↓
优化策略：                           优化策略：
• 使用 Shared Memory                • 增加并行度
• 合并内存访问                      • 减少分支分歧
• 向量化读取                        • 增加 occupancy
```

---

## 🎯 实验场景

### **实验1：理解 Tile Size 对性能的影响**

**代码**：
```python
import torch
import torch.utils.benchmark as benchmark

def bench_matmul(M, N, K):
    a = torch.randn(M, K, device='cuda', dtype=torch.float16)
    b = torch.randn(K, N, device='cuda', dtype=torch.float16)

    timer = benchmark.Timer(
        stmt="torch.matmul(a, b)",
        globals={'a': a, 'b': b},
    )
    return timer.blocked_autorange(min_run_time=1)

sizes = [(512, 512, 512), (1024, 1024, 1024), (2048, 2048, 2048)]

for M, N, K in sizes:
    time = bench_matmul(M, N, K)
    gflops = (2 * M * N * K) / (time.mean * 1e9)
    print(f"{M}x{N}x{K}: {time.mean*1000:.2f} ms, {gflops:.1f} GFLOPS")
```

**预期发现**：

| 矩阵大小 | 延迟 | 吞吐 | 原因 |
|---------|------|------|------|
| 512³ | 0.5 ms | 268 GFLOPS | 矩阵太小，kernel launch 开销大 |
| 1024³ | 2.1 ms | 1012 GFLOPS | 接近 peak |
| 2048³ | 15.8 ms | 1085 GFLOPS | 充分利用 Tensor Core |

---

### **实验2：理解 Tensor Core**

**对比 FP32 vs FP16**：

```python
import torch

M, N, K = 2048, 2048, 2048

# FP32 (无 Tensor Core)
a_fp32 = torch.randn(M, K, device='cuda', dtype=torch.float32)
b_fp32 = torch.randn(K, N, device='cuda', dtype=torch.float32)

# FP16 (有 Tensor Core)
a_fp16 = torch.randn(M, K, device='cuda', dtype=torch.float16)
b_fp16 = torch.randn(K, N, device='cuda', dtype=torch.float16)

# 测量时间
# ...

# 结果
# FP32: 50 GFLOPS
# FP16: 1100 GFLOPS (22x 加速！)
```

**Nsight Compute 分析**：

```
FP32 版本：
  smsp__pipe_tensor_cycles_active.avg.pct_of_peak: 0% (未使用)

FP16 版本：
  smsp__pipe_tensor_cycles_active.avg.pct_of_peak: 90% (充分使用)
```

**认知映射**：

```
数据类型              硬件单元
FP32              →  CUDA Core (标量/向量)
FP16/BF16         →  Tensor Core (4x4x4 矩阵)
INT8              →  Tensor Core (8x8x8 矩阵)
```

---

## 💡 下一步学习路径

### **Week 1: 观测工具**
- [ ] 使用 `torch.profiler` 分析 PyTorch 代码
- [ ] 使用 Nsight Compute 分析 kernel 性能
- [ ] 理解 Occupancy、Memory Throughput、Warp Efficiency

### **Week 2: Triton 编程**
- [ ] 实现简单的向量加法
- [ ] 实现 Softmax
- [ ] 实现矩阵乘法

### **Week 3: CUDA 编程**
- [ ] 理解 Thread Hierarchy（Grid/Block/Warp）
- [ ] 使用 Shared Memory 优化矩阵乘法
- [ ] 理解 Memory Coalescing

### **Week 4: 性能优化**
- [ ] 分析实际项目的瓶颈
- [ ] 优化内存访问模式
- [ ] 调整 Block/Grid 配置

---

**记住**：GPU 性能优化的核心是**隐藏延迟**：
1. **Memory Latency** → 用 Cache、Shared Memory
2. **Compute Latency** → 用 Tensor Core
3. **Warp Divergence** → 减少分支
4. **Synchronization** → 异步执行
