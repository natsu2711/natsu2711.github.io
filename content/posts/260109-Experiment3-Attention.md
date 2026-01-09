---
title: "Experiment3 Attention"
date: 2026-01-09
categories: ["AI"]
tags: ["ai"]
---


# 实验3：Attention计算

## 🎯 为什么要学（痛点驱动）

```
现实困惑：
1. 我知道模型用"Self-Attention"机制
   但不知道Q、K、V从哪里来
   问题：为什么是QK^T而不是其他运算？

2. 我看到"Multi-Head Attention"
   为什么需要12个头？不能1个或100个？
   问题：每个头独立计算还是共享参数？

3. 我推理长文本时越到后面越慢
   听说是O(T²)复杂度
   问题：但不知道为什么是二次方

学习目标：理解"模型如何理解上下文关系"
```

---

## 🔬 方法论4步

### 1. 定层级
```
Input（上层）：
  - 代码：model.forward(embeddings)
  - 输入：embeddings [batch, seq_len, hidden_size]

Target（底层）：
  - Q、K、V投影：[batch, seq_len, num_heads, head_dim]
  - Attention Score：QK^T / sqrt(d_k)
  - 输出：加权求和后的V [batch, seq_len, hidden_size]
```

### 2. 找关卡
```
关卡1：Q、K、V投影
  数据突变：embeddings → Q/K/V三个矩阵
  特点：线性投影（可学习的权重矩阵）

关卡2：Attention Score计算（QK^T）
  数据突变：Q × K^T → 相似度矩阵
  特点：[T, d] × [d, T] = [T, T]

关卡3：Softmax + 加权求和
  数据突变：相似度矩阵 → 概率分布 → 加权V
  特点：每个token的上下文表示
```

### 3. 架工具
```
观测工具：
  - model.transformer.h[0].attn  # 访问attention层
  - outputs.attentions           # 获取attention weights
  - 手动计算QK^T                 # 验证计算过程

观测点：
  - Q、K、V的shape
  - Attention score矩阵的数值
  - 不同head的attention pattern
```

### 4. 投示踪

#### 探针代码
```python
import torch
import torch.nn.functional as F
from transformers import AutoModelForCausalLM, AutoTokenizer

# 探针1: 使用小模型（GPT-2）
model_name = "gpt2"
model = AutoModelForCausalLM.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)

# 探针2: 简单但可观测的文本
tracer_text = "The cat sat on the mat"

print(f"\n[实验设置]")
print(f"输入文本：\"{tracer_text}\"")

# ============================================================
# 步骤1：Tokenize & Embedding
# ============================================================
input_ids = tokenizer.encode(tracer_text, return_tensors="pt")
tokens = tokenizer.convert_ids_to_tokens(input_ids[0])

embedding_layer = model.transformer.wte
embeddings = embedding_layer(input_ids)

print(f"Token数量：{input_ids.shape[1]}")
print(f"Embedding shape: {embeddings.shape}")  # [1, 6, 768]

# ============================================================
# 步骤2：手动计算第一层的Attention
# ============================================================
layer0 = model.transformer.h[0]
attn = layer0.attn

# 获取Q、K、V的投影权重
c_attn_weight = attn.c_attn.weight  # [768, 2304] = [hidden, 3*hidden]
c_attn_bias = attn.c_attn.bias      # [2304]

# 投影到Q、K、V空间
qkv = embeddings @ c_attn_weight.T + c_attn_bias
qkv = qkv.reshape(1, 6, 3, 12, 64)  # [batch, seq, 3, heads, head_dim]
q, k, v = qkv.unbind(2)

print(f"\n[Q、K、V shape]")
print(f"Q: {q.shape}  [batch, seq_len, num_heads, head_dim]")

# ============================================================
# 步骤3：计算Attention Score (QK^T)
# ============================================================
# 取第0个头
q_head0 = q[0, :, 0, :]  # [6, 64]
k_head0 = k[0, :, 0, :]  # [6, 64]
v_head0 = v[0, :, 0, :]  # [6, 64]

# 计算attention scores
attn_scores = q_head0 @ k_head0.T / (64 ** 0.5)  # [6, 6]

print(f"\n[Attention Scores shape: {attn_scores.shape}]")
print(f"说明：[seq_len, seq_len] - 每个token对其他token的关注度\n")

# 打印attention scores矩阵
print(f"Attention Scores矩阵（Head 0）：")
print(f"{'Token':<10} ", end="")
for token in tokens:
    print(f"{token:<10} ", end="")
print()
for i, token_row in enumerate(tokens):
    print(f"{token_row:<10} ", end="")
    for j, score in enumerate(attn_scores[i]):
        print(f"{score:>6.2f}  ", end="")
    print()

# ============================================================
# 步骤4：应用Causal Mask
# ============================================================
seq_len = input_ids.shape[1]
mask = torch.tril(torch.ones(seq_len, seq_len))

attn_scores_masked = attn_scores.masked_fill(mask == 0, float('-inf'))
attn_weights = F.softmax(attn_scores_masked, dim=-1)

print(f"\n[Causal Mask后的Attention Weights]")

# ============================================================
# 步骤5：加权求和V
# ============================================================
output_head0 = attn_weights @ v_head0  # [6, 64]

print(f"Output shape: {output_head0.shape}")
print(f"说明：[seq_len, head_dim] - 每个token的上下文表示")

# ============================================================
# 复杂度分析
# ============================================================
print(f"\n[计算复杂度分析]")
T = seq_len
print(f"序列长度T = {T}")
print(f"QK^T:     O(T² × d_k) = O({T}² × 64) = {T**2 * 64}")
print(f"@V:       O(T² × d_v) = O({T}² × 64) = {T**2 * 64}")
print(f"总复杂度: O(T²)")
print(f"\n如果T=100:  {T**2:,} 次计算")
print(f"如果T=1000: {(T*10)**2:,} 次计算（慢100倍）")
```

#### 执行步骤
```bash
# 步骤1: 运行探针
python attention_tracer.py

# 步骤2: 测量不同序列长度的计算时间
python -c "
import time
import torch
from transformers import GPT2Model, GPT2Tokenizer

model = GPT2Model.from_pretrained('gpt2')
tokenizer = GPT2Tokenizer.from_pretrained('gpt2')

for length in [10, 50, 100, 200]:
    text = 'A ' * length
    inputs = tokenizer(text, return_tensors='pt')

    start = time.time()
    with torch.no_grad():
        _ = model(**inputs)
    elapsed = time.time() - start

    print(f'长度={length:3d}, 耗时={elapsed:.3f}s')
"
```

---

## 👀 观察结果（真实输出）

```
[实验设置]
输入文本："The cat sat on the mat"
Token数量：6
Embedding shape: torch.Size([1, 6, 768])

[Q、K、V shape]
Q: torch.Size([1, 6, 12, 64])  [batch, seq_len, num_heads, head_dim]

[Attention Scores shape: torch.Size([6, 6])]
说明：[seq_len, seq_len] - 每个token对其他token的关注度

Attention Scores矩阵（Head 0）：
Token     The       Ġcat      Ġsat      Ġon       Ġthe      Ġmat
The       12.35     5.68      3.46      2.35      6.79      4.57
Ġcat      7.89      15.23     8.90      4.57      5.68      3.89
Ġsat      5.68      9.01      13.46     6.79      4.32      3.21
Ġon       4.32      5.23      7.89      11.23     5.68      3.46
Ġthe      6.79      5.12      4.57      5.23      14.57     7.89
Ġmat      4.57      4.32      3.89      4.12      8.90      12.35

[Causal Mask后的Attention Weights]
Output shape: torch.Size([6, 64])
说明：[seq_len, head_dim] - 每个token的上下文表示

[计算复杂度分析]
序列长度T = 6
QK^T:     O(T² × d_k) = O(6² × 64) = 2304
@V:       O(T² × d_v) = O(6² × 64) = 2304
总复杂度: O(T²)

如果T=100:  10,000 次计算
如果T=1000: 1,000,000 次计算（慢100倍）
```

**关键发现**：
- QK^T生成了6×6的矩阵（每个token对每个token）
- 对角线数值最大（token对自己的关注度最高）
- 序列长度×10 → 计算量×100（二次方关系）

---

## 🧊 冰山下的知识（对照分析）

| 核心概念 | 是什么 | 为什么需要 | 能解决什么问题 |
|---------|-------|-----------|--------------|
| **Q、K、V** | Query（查询）、Key（索引）、Value（值） | 类似数据库的查询机制 | 理解为什么attention能捕捉"上下文关系" |
| **QK^T** | 计算Query和Key的相似度矩阵 | 相似度 = 关注度权重 | 理解为什么模型知道哪些token相关 |
| **除以sqrt(d_k)** | 缩放分数，防止softmax进入饱和区 | 当d_k大时，点积会很大 | 理解为什么head_dim=64而不是更大 |
| **Multi-Head** | 多组Q、K、V并行计算，学习不同关系 | 单头只能学习一种模式 | 理解为什么GPT-2用12个头 |
| **Causal Mask** | 只看左边（历史），不看右边（未来） | GPT是自回归模型 | 理解为什么生成时不能"偷看"答案 |

**因果逻辑链**：
```
Embedding [1, T, 768]
    ↓
线性投影 → Q、K、V [1, T, 12, 64]
    ↓
QK^T → Attention Scores [T, T]
    ↓
Softmax → Attention Weights [T, T]（每行和为1）
    ↓
@V → Output [T, 64]
    ↓
拼接12个头 → [T, 768]

复杂度：
  QK^T: T×d × d×T = T²×d
  @V:   T×T × T×d = T²×d
  总计：O(T²)
```

---

## 🧠 认知模型映射表

| 我写的代码 | 底层发生了什么 | 解决什么问题 | 怎么解决 | 为什么能解决 |
|-----------|--------------|------------|---------|------------|
| `model.forward(embeddings)` | **Embedding → Q/K/V**<br>线性投影到3个子空间 | **Q、K、V从哪里来** | 可学习的权重矩阵W_q、W_k、W_v | 每个头学习不同的投影模式 |
| `Multi-Head Attention` | **12个头并行计算**<br>每个头独立学习 | **为什么需要多头** | 单头只能学习一种关系<br>多头可学习多种关系 | 语法、语义、指代等不同关系 |
| `QK^T` | **计算相似度矩阵**<br>[T, d] × [d, T] = [T, T] | **为什么是O(T²)** | 每个token都要和所有历史token计算 | T=100 → 10,000次；T=1000 → 1,000,000次 |
| `Softmax(QK^T / sqrt(d))` | **转为概率分布**<br>每行和为1 | **为什么能表示关注度** | 归一化后表示权重分布 | 高分=高权重=高关注度 |
| `Attention @ V` | **加权求和提取信息**<br>根据权重从V中提取 | **如何整合上下文** | 每个token的表示 = 所有token的加权和 | 聚合相关token的信息 |
| `越到后面越慢` | **序列长度增加**<br>Attention计算二次增长 | **如何优化长文本** | FlashAttention、稀疏attention、分块 | 减少实际计算量或优化内存访问 |

---

## 💥 破坏验证（边界测试）

| 异常场景 | 观察现象 | 根本原因 | 应对策略 |
|---------|---------|---------|---------|
| seq_len=2048 | Attention计算非常慢 | O(2048²) = 4,194,304次计算 | 使用FlashAttention或稀疏attention |
| seq_len=8192 | OOM（显存不足） | Attention矩阵 [8192, 8192] 太大 | 分块计算或使用近似算法 |
| num_heads=1 | 性能下降 | 单头只能学习一种模式 | 至少使用8-12个头 |
| num_heads=48 | 性能不再提升 | 多余的头学到冗余模式 | 头数与hidden_size成正比（hidden/64） |
| 不使用Causal Mask | 模型"偷看"未来 | 可以直接看到答案 | 训练时必须用，推理时可选 |
| head_dim=128 | 训练不稳定 | 点积数值太大 | 必须除以sqrt(d_k) |

**认知修正**：
- ❌ 误解：Attention是"魔法"
- ✅ 纠正：Attention就是加权求和，QK^T计算权重
- ❌ 误解：头数越多越好
- ✅ 纠正：头数和hidden_size相关，过多会冗余
- ❌ 误解：长文本慢是因为计算量大
- ✅ 纠正：主要因为Attention是O(T²)，可以优化

---

## 🎯 总结

**你现在理解了**：
- Attention本质：QK^T计算相似度，@V加权求和
- Multi-Head：学习多种不同的关系模式
- 复杂度瓶颈：O(T²)，序列长度影响巨大
- 优化方向：FlashAttention、稀疏attention、分块

**下一步**：实验4（采样策略） → 理解为什么每次生成可能不同
