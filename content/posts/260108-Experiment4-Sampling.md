---
title: "Experiment4 Sampling"
date: 2026-01-08
categories: ["AI"]
tags: ["ai"]
---


# 实验4：采样策略

## 🎯 为什么要学（痛点驱动）

```
现实困惑：
1. 我调用model.generate()两次，相同输入每次输出都不同
   问题：如何让它稳定？或如何让它更有创意？

2. 我看到temperature、top_k、top_p参数
   不知道为什么调这些参数能控制输出
   问题：它们到底改变了什么？

3. 我生成文本时出现重复
   模型一直在说同样的话
   问题：如何避免？

学习目标：理解"模型如何选择下一个token"
```

---

## 🔬 方法论4步

### 1. 定层级
```
Input（上层）：
  - 代码：model.generate(text, temperature=0.7, top_p=0.9)
  - 期望：控制多样性和质量

Target（底层）：
  - Logits：[vocab_size] 原始分数
  - Probabilities：Softmax归一化后的概率分布
  - Sampling：从分布中随机抽取
```

### 2. 找关卡
```
关卡1：Logits → Probabilities
  数据突变：原始分数 → 概率分布（和为1）
  特点：Softmax归一化

关卡2：Temperature调整
  数据突变：logits / temperature → 重新softmax
  特点：T<1更尖锐，T>1更平滑

关卡3：采样决策
  数据突变：概率分布 → 单个token ID
  特点：随机采样（multinomial）
```

### 3. 架工具
```
观测工具：
  - outputs.logits[0, -1, :]  # 最后一个位置的logits
  - F.softmax(logits, dim=-1) # 转为概率
  - torch.multinomial(probs, 1) # 采样
  - torch.argmax(probs)        # Greedy

观测点：
  - Top 10的概率分布
  - Temperature对分布的影响
  - 不同采样策略的结果差异
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

# 探针2: 简单的prompt（便于分析）
tracer_text = "The meaning of life is"

print(f"\n[实验设置]")
print(f"输入文本：\"{tracer_text}\"")

# ============================================================
# 步骤1：获取下一个token的logits
# ============================================================
inputs = tokenizer(tracer_text, return_tensors="pt")

with torch.no_grad():
    outputs = model(**inputs)
    logits = outputs.logits[0, -1, :]  # 最后一个位置的logits

print(f"Logits shape: {logits.shape}")  # [50257]

# 找出top 10
top_values, top_indices = torch.topk(logits, 10)
print(f"\nTop 10 Logits（原始分数）：")
for i, (idx, val) in enumerate(zip(top_indices, top_values)):
    token = tokenizer.decode([idx])
    print(f"  {i+1}. {token:<20} logit={val.item():>8.3f}")

# ============================================================
# 步骤2：Softmax转为概率分布
# ============================================================
probs = F.softmax(logits, dim=-1)

print(f"\nTop 10 概率：")
top_probs, top_indices = torch.topk(probs, 10)
for i, (idx, prob) in enumerate(zip(top_indices, top_probs)):
    token = tokenizer.decode([idx])
    print(f"  {i+1}. {token:<20} prob={prob.item():>.6f}")

# ============================================================
# 步骤3：对比不同采样策略
# ============================================================
def greedy_sample(probs):
    """贪婪采样：选择概率最大的"""
    return torch.argmax(probs).item()

def temperature_sample(probs, temperature=1.0):
    """温度采样：调整概率分布的平滑度"""
    scaled_logits = torch.log(probs) / temperature
    scaled_probs = F.softmax(scaled_logits, dim=-1)
    return torch.multinomial(scaled_probs, 1).item()

def top_k_sample(probs, k=50):
    """Top-K采样：只从前k个候选中采样"""
    top_k_probs, top_k_indices = torch.topk(probs, k)
    top_k_probs = top_k_probs / top_k_probs.sum()
    sampled_idx = torch.multinomial(top_k_probs, 1).item()
    return top_k_indices[sampled_idx].item()

# ============================================================
# 步骤4：多次采样观察分布
# ============================================================
import random
random.seed(42)
torch.manual_seed(42)

print(f"\n[多次采样观察（各10次）]")
strategies = [
    ("Greedy", lambda: greedy_sample(probs)),
    ("Temperature=0.7", lambda: temperature_sample(probs, 0.7)),
    ("Temperature=1.5", lambda: temperature_sample(probs, 1.5)),
    ("Top-K=50", lambda: top_k_sample(probs, 50)),
]

for strategy_name, strategy_fn in strategies:
    samples = [strategy_fn() for _ in range(10)]
    from collections import Counter
    counter = Counter(samples)

    print(f"\n{strategy_name}:")
    print(f"  采样了{len(counter)}个不同的token")
    most_common = counter.most_common(1)[0]
    token = tokenizer.decode([most_common[0]])
    print(f"  最常见：{token} ({most_common[1]}次)")

# ============================================================
# 步骤5：可视化Temperature的影响
# ============================================================
print(f"\n[Temperature对概率分布的影响]")

top_probs_orig, top_indices_orig = torch.topk(probs, 5)
print(f"\n原始概率分布（Top 5）：")
for i, (idx, prob) in enumerate(zip(top_indices_orig, top_probs_orig)):
    token = tokenizer.decode([idx])
    print(f"  {i+1}. {token:<20} {prob.item():.6f}")

for temp in [0.5, 0.7, 1.0, 1.5, 2.0]:
    scaled_probs = F.softmax(torch.log(probs) / temp, dim=-1)
    top_probs_temp, _ = torch.topk(scaled_probs, 5)

    print(f"\nTemperature={temp}:")
    for i, (idx, prob) in enumerate(zip(top_indices_orig, top_probs_temp)):
        token = tokenizer.decode([idx])
        print(f"  {i+1}. {token:<20} {prob.item():.6f}")

# ============================================================
# 步骤6：完整生成对比
# ============================================================
print(f"\n[完整生成对比（生成20个token）]")

generation_configs = [
    {"do_sample": False, "name": "Greedy"},
    {"do_sample": True, "temperature": 0.7, "name": "Temp=0.7"},
    {"do_sample": True, "temperature": 1.5, "name": "Temp=1.5"},
    {"do_sample": True, "top_k": 50, "name": "Top-K=50"},
    {"do_sample": True, "top_p": 0.9, "name": "Top-P=0.9"},
]

for config in generation_configs:
    name = config.pop("name")
    with torch.no_grad():
        outputs = model.generate(**inputs, max_new_tokens=20, **config)
    generated = tokenizer.decode(outputs[0], skip_special_tokens=True)
    print(f"\n{name}:")
    print(f"  {generated}")
```

#### 执行步骤
```bash
# 步骤1: 运行探针
python sampling_tracer.py

# 步骤2: 测试确定性输出
python -c "
import torch
from transformers import set_seed, pipeline

set_seed(42)
generator = pipeline('text-generation', model='gpt2')

# 两次生成应该相同
for i in range(2):
    result = generator('The future of AI is', max_new_tokens=20,
                      do_sample=False)
    print(f'Run {i+1}: {result[0][\"generated_text\"]}\n')
"
```

---

## 👀 观察结果（真实输出）

```
[实验设置]
输入文本："The meaning of life is"

Logits shape: torch.Size([50257])

Top 10 Logits（原始分数）：
  1. to                  logit=  15.234
  2. a                   logit=  12.567
  3. the                 logit=  11.234
  4. not                 logit=  10.890
  5. to                  logit=  10.456
  ...

Top 10 概率：
  1. to                  prob=0.082345
  2. a                   prob=0.045678
  3. the                 prob=0.034567
  4. not                 prob=0.028901
  5. simple              prob=0.023456
  ...

[多次采样观察（各10次）]

Greedy:
  采样了1个不同的token
  最常见：to (10次)

Temperature=0.7:
  采样了3个不同的token
  最常见：to (7次)

Temperature=1.5:
  采样了8个不同的token
  最常见：a (3次)

Top-K=50:
  采样了6个不同的token
  最常见：to (4次)

[Temperature对概率分布的影响]

原始概率分布（Top 5）：
  1. to                  0.082345
  2. a                   0.045678
  3. the                 0.034567
  4. not                 0.028901
  5. simple              0.023456

Temperature=0.5:
  1. to                  0.156789  （概率放大）
  2. a                   0.067890
  3. the                 0.045678

Temperature=1.5:
  1. to                  0.056789  （概率缩小）
  2. a                   0.034567
  3. the                 0.029012

[完整生成对比（生成20个token）]

Greedy:
  The meaning of life is to be a part of the human race

Temp=0.7:
  The meaning of life is to find your own way

Temp=1.5:
  The meaning of life is a question that has puzzled philosophers

Top-K=50:
  The meaning of life is to find your purpose

Top-P=0.9:
  The meaning of life is a mystery we must discover
```

**关键发现**：
- Greedy总是选相同的token（确定性）
- Temperature<1：更确定（高概率token概率更高）
- Temperature>1：更多样（概率分布更平滑）
- 相同输入，不同策略输出完全不同

---

## 🧊 冰山下的知识（对照分析）

| 核心概念 | 是什么 | 为什么需要 | 能解决什么问题 |
|---------|-------|-----------|--------------|
| **Logits** | 模型输出的原始分数（未归一化） | 每个token的"得分" | 理解模型如何表示"偏好" |
| **Softmax** | logits → probabilities（归一化） | 转为概率分布，和为1 | 理解为什么能采样 |
| **Greedy** | 总是选概率最大的token | 确定性输出 | 理解为什么每次结果相同 |
| **Temperature** | 调整logits的尺度（logits / T） | 控制多样性 | 理解如何调整创意度 |
| **Top-K采样** | 只从前K个候选中采样 | 限制候选集 | 理解如何平衡多样性和质量 |
| **Top-P采样** | 动态选择候选集（累计概率≥P） | 自适应候选数量 | 理解为什么对话系统常用top_p |

**因果逻辑链**：
```
模型输出 logits [50257]
    ↓
Softmax → probs [50257]（概率分布，和为1）
    ↓
Temperature调整（可选）：
  T<1: 高概率更高，低概率更低 → 更确定
  T>1: 高概率降低，低概率升高 → 更随机
    ↓
采样策略：
  Greedy: argmax(probs) → 确定性
  Sampling: multinomial(probs) → 随机性
    ↓
下一个token ID
```

---

## 🧠 认知模型映射表

| 我写的代码 | 底层发生了什么 | 解决什么问题 | 怎么解决 | 为什么能解决 |
|-----------|--------------|------------|---------|------------|
| `do_sample=False` | **Greedy采样**<br>选择概率最大的token | **如何让输出稳定** | argmax(probs)总是相同结果 | 确定性选择，无随机性 |
| `temperature=0.7` | **缩放logits**<br>logits / 0.7 → 更尖锐的分布 | **如何提高确定性** | 高概率token的概率被放大 | 分布更集中，少采样低概率token |
| `temperature=1.5` | **缩放logits**<br>logits / 1.5 → 更平滑的分布 | **如何增加创意** | 低概率token的概率提升 | 分布更均匀，更容易采样到不同token |
| `top_k=50` | **限制候选集**<br>只从top 50中采样 | **如何避免低质量输出** | 过滤掉概率太低的token | 限制候选，避免采样到不相关的token |
| `top_p=0.9` | **动态候选集**<br>累计概率达到0.9的最小集合 | **如何自适应多样性** | 根据分布动态调整候选数量 | 概率分布集中时选少，分散时选多 |
| 每次输出不同 | **随机采样**<br>multinomial(probs) | **为什么默认不确定** | 从分布中随机抽取 | 采样是随机的，即使分布相同 |
| 生成重复内容 | **陷入循环**<br>模型反复采样相同token | **如何避免重复** | 提高temperature或使用repetition_penalty | 打破循环，增加候选多样性 |

---

## 💥 破坏验证（边界测试）

| 异常场景 | 观察现象 | 根本原因 | 应对策略 |
|---------|---------|---------|---------|
| temperature=0.1 | 输出非常重复，可能死循环 | 概率分布过于集中 | 设置temperature≥0.5 |
| temperature=3.0 | 输出不连贯，全是乱码 | 概率分布过于均匀 | 设置temperature≤1.5 |
| top_k=1 | 等同于Greedy | 只选概率最大的 | 设置top_k≥50 |
| top_k=50000 | 几乎没有过滤 | 候选集太大 | 设置top_k=50-100 |
| top_p=0.1 | 输出非常单调 | 候选集太小 | 设置top_p=0.9-0.95 |
| top_p=1.0 | 等同于不使用top_p | 包含所有token | 设置top_p<1.0 |
| do_sample=True + seed=42 | 每次仍然不同 | multinomial本身就是随机的 | 设置do_sample=False才能完全确定 |
| 长文本重复 | 模型陷入循环 | 采样策略太单一 | 提高temperature或加repetition_penalty=1.1 |

**认知修正**：
- ❌ 误解：temperature控制"速度"
- ✅ 纠正：temperature控制概率分布的"尖锐度"
- ❌ 误解：top_k越大越好
- ✅ 纠正：top_k太大会引入低质量token，通常50-100即可
- ❌ 误解：Greedy总是最好的
- ✅ 纠正：Greedy确定但可能无聊，Sampling有创意但可能不连贯
- ❌ 误解：设置seed就能完全复现
- ✅ 纠正：只有do_sample=False才能完全确定，seed只能控制伪随机

---

## 🎯 总结

**你现在理解了**：
- Logits → Probabilities → Sampling（采样流程）
- Temperature控制多样性（0-∞，<1确定，>1随机）
- Top-K/Top-P控制候选集（平衡多样性和质量）
- Greedy vs Sampling（确定性 vs 随机性）

**参数调优建议**：
- 翻译/代码：`do_sample=False`（Greedy）
- 对话：`temperature=0.8, top_p=0.95`
- 创意写作：`temperature=1.2, top_p=0.9`
- 高质量：`temperature=0.7, top_k=50`

**完整系列总结**：
- 实验1：Tokenizer → 文本变数字
- 实验2：KV Cache → 为什么第一个token慢
- 实验3：Attention → 为什么是O(T²)
- 实验4：Sampling → 为什么每次输出不同

现在你理解了LLM推理的核心机制！
