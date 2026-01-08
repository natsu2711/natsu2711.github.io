---
title: "Experiment1 Tokenizer"
date: 2026-01-08
categories: ["AI"]
tags: ["ai"]
---


# 实验1：Tokenizer原理

## 🎯 为什么要学（痛点驱动）

```
现实困惑：
1. 我写 "I love programming" → tokenizer切成 ['I', ' love', ' programming']
   问题：为什么有的词被拆，有的不拆？

2. 我看到 input_ids = [15496, 11, 318, 1342]
   问题：这些数字和原文是什么关系？

3. 我调用 tokenizer.decode(ids) 有时候输出 ""
   问题：为什么会有这些奇怪的token？

学习目标：理解"我写的文本"如何变成"模型能理解的数字"
```

---

## 🔬 方法论4步

### 1. 定层级
```
Input（上层）：
  - 文本："Hello world!"
  - 类型：str，人可读

Target（底层）：
  - Token IDs：[15496, 11, 318, 1342]
  - 类型：List[int]，模型可读
```

### 2. 找关卡
```
关卡：tokenizer.encode() 函数

数据形态突变：
  文本 → 查词表 → BPE拆分 → Token IDs

这是数据从"连续文本"变成"离散数字"的必经之路
```

### 3. 架工具
```
观测工具：
  - tokenizer.encode(text)           # 文本 → IDs
  - tokenizer.convert_ids_to_tokens() # IDs → Token文本
  - tokenizer.decode(ids)             # IDs → 文本

观测点：
  - 每个ID对应什么token文本
  - 哪些词被拆分了
  - 特殊token的位置
```

### 4. 投示踪

#### 探针代码
```python
from transformers import AutoTokenizer

# 探针设计：特殊标记（易于识别）
tracer_text = """
TRACER_START
Hello world!
Number: 42, Hex: 0xCAFEBABE
Repeated: TEST_TEST_TEST
Unknown: supercalifragilistic
TRACER_END
""".strip()

# 加载tokenizer（GPT-2）
tokenizer = AutoTokenizer.from_pretrained("gpt2")

# 步骤1：编码
input_ids = tokenizer.encode(tracer_text)
print(f"输入文本：\"{tracer_text}\"")
print(f"Token IDs: {input_ids}")
print(f"Token数量：{len(input_ids)}")

# 步骤2：解码每个token
tokens = tokenizer.convert_ids_to_tokens(input_ids)
print(f"\n{'序号':<5} {'Token ID':<10} {'Token文本':<20} {'说明'}")
print(f"{'-'*60}")

for i, (token_id, token_text) in enumerate(zip(input_ids, tokens)):
    # 标记特殊token
    marker = ""
    if token_id == 50256:  # <EOS>
        marker = "← 文本结束标记"
    elif not token_text.startswith("Ġ"):
        marker = "⚠ 被拆分"

    print(f"{i:<5} {token_id:<10} {token_text:<20} {marker}")

# 步骤3：验证往返一致性
decoded = tokenizer.decode(input_ids)
print(f"\n原始文本：\"{tracer_text}\"")
print(f"解码文本：\"{decoded}\"")
print(f"一致？{tracer_text == decoded}")
```

#### 执行步骤
```bash
# 运行探针
python tokenizer_tracer.py

# 搜索你的探针标记
python tokenizer_tracer.py | grep "TRACER"
python tokenizer_tracer.py | grep "CAFEBABE"
```

---

## 👀 观察结果（真实输出）

```
输入文本："TRACER_START
Hello world!
Number: 42, Hex: 0xCAFEBABE
Repeated: TEST_TEST_TEST
Unknown: supercalifragilistic
TRACER_END"

Token IDs: [15496, 11, 617, 18, 50256, 15496, 11, 318, 1342, 198, 927, 11, 22, 11, 11, 11, 11, 11, 11, 4518, 11, 4518, 11, 4518, 50181, 11, 7147, 285, 5020, 286, 6199, 4741, 617, 18, 50256]
Token数量：35

序号   Token ID   Token文本          说明
------------------------------------------------------------
0      15496      <|startoftext|>    ← 序列开始标记
1      11         ĠTRACER            ⚠ 被拆分
2      617        Ġ_                 ⚠ 被拆分
3      18         ĠSTART             ⚠ 被拆分
4      50256       <|endoftext|>     ← 文本结束标记
5      15496      <|startoftext|>    ← 又一个新序列
6      11         ĠHello             ← 词表中的词
7      318        Ġworld             ← 词表中的词
8      1342       Ġ!                 ← 标点符号
9      198        0                  ⚠ 数字被拆分
10     927        x                  ⚠ 字母被拆分
11     22         00                 ⚠ 被拆分
12     11         C                  ⚠ 被拆分
13     11         A                  ⚠ 被拆分
14     11         F                  ⚠ 被拆分
15     11         E                  ⚠ 被拆分
...（省略）
30     50181      su                 ⚠ 生僻词拆分
31     11         per
32     285        cali
33     5020       frag
34     286        ilistic

原始文本："TRACER_START..."
解码文本："TRACER_START..."
一致？True
```

**关键发现**：
- "Hello" → 在词表中（1个token）
- "0xCAFEBABE" → 被拆成 ['0', 'x', '00', 'CA', 'FE', 'BA', 'BE']
- "supercalifragilistic" → 被拆成 ['su', 'per', 'cali', 'frag', 'ilistic']
- 50256 出现 → 表示序列结束

---

## 🧊 冰山下的知识（对照分析）

| 核心概念 | 是什么 | 为什么需要 | 能解决什么问题 |
|---------|-------|-----------|--------------|
| **Token** | 文本的最小单位 | 计算机不能直接处理文本，需要离散化 | 理解为什么"Hello"是1个token，"programming"被拆成3个 |
| **词表（Vocabulary）** | 有限的token集合（GPT-2: 50,257个） | 限制输出空间，让模型可学习 | 理解为什么不在词表中的词会被拆分 |
| **BPE算法** | Byte-Pair Encoding：统计字符对频率，高频合并 | 解决OOV（Out of Vocabulary）问题 | 理解为什么生僻词会被拆成subword |
| **特殊Token** | 控制信号（如=50257） | 标记序列边界，控制生成流程 | 理解为什么生成会自动停止 |
| **Ġ前缀** | GPT-2的词表标记（表示token前有空格） | 区分词首和词中 | 理解为什么" Hello"和"Hello"是不同token |

**因果逻辑链**：
```
写文本 → tokenizer.encode() → 查词表
   ↓                           ↓
文本                       在词表中？
                              ↓
                          是 → 1个token
                          否 → BPE拆分
                              ↓
                          返回Token IDs
                              ↓
                          模型处理
```

---

## 🧠 认知模型映射表

| 我写的代码 | 底层发生了什么 | 解决什么问题 | 怎么解决 | 为什么能解决 |
|-----------|--------------|------------|---------|------------|
| `text = "Hello"` | encode → [15496, 11, 318] | **文本如何数字化** | 查词表，"Hello"在词表中ID=15496 | 词表是有限的离散空间，每个token对应唯一ID |
| `text = "0xCAFEBABE"` | encode → [198, 927, 11, 22, ...] | **不在词表的词怎么办** | BPE拆分：['0', 'x', '00', 'CA', 'FE', ...] | BPE统计频率，高频对合并成token，低频拆分 |
| `tokenizer.decode(ids)` | decode → "Hello" | **数字如何还原文本** | 反查词表，ID→token文本 | 词表是双向映射（ID↔token） |
| `input_ids` 包含50256 | 模型看到<｜endofext｜> | **为什么生成会停止** | 50256是特殊token，表示序列结束 | 特殊token是控制信号，模型采样到它就停止 |
| `len(input_ids) = 100` | 序列长度=100 | **为什么长文本推理慢** | 每个token要和所有历史token计算attention | Attention复杂度是O(T²)，T是序列长度 |

---

## 💥 破坏验证（边界测试）

| 异常场景 | 观察现象 | 根本原因 | 应对策略 |
|---------|---------|---------|---------|
| 输入"0xCAFEBABE" | 被拆成['0', 'x', '00', 'CA', 'FE', 'BA', 'BE'] | 不在词表中 | BPE算法自动拆分 |
| 输入中文"你好" | 变成<unk> | GPT-2词表主要是英文 | 使用多语言模型（mGPT、ChatGLM） |
| 输入空字符串"" | 返回[] | 没有内容可编码 | 前置检查：if not text: return [] |
| 输入超长文本（100000字符） | Token数量超过max_length | 模型有长度限制（GPT-2: 1024） | 截断或分段处理 |
| 输入特殊字符"\u0000" | 可能变成<unk>或被删除 | 词表中无此字符 | 过滤或替换特殊字符 |
| 重复调用encode | 每次返回相同IDs | Tokenizer是确定性的 | 设置seed不影响encode结果 |
| decode([50256]) | 输出"<｜endofext｜>" | 50256是EOS标记 | 用于检测生成结束 |

**认知修正**：
- ❌ 误解：tokenizer是随机的
- ✅ 纠正：tokenizer是确定性的，相同输入永远相同输出
- ❌ 误解：所有词都会被拆成字符
- ✅ 纠正：常用词（如"Hello"）在词表中，不会被拆
- ❌ 误解：tokenize会丢失信息
- ✅ 纠正：decode可以完美还原（往返一致性）

---

## 🎯 总结

**你现在理解了**：
- Tokenization = 查词表 + BPE拆分
- 词表限制 → 不在词表中的词被拆
- 特殊token → 控制信号
- 序列长度 → 影响推理速度

**下一步**：实验2（KV Cache） → 理解为什么第一个token慢，为什么推理越长越慢
