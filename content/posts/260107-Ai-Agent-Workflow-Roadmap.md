---
title: "Ai Agent Workflow Roadmap"
date: 2026-01-07
categories: ["AI"]
tags: ["agent", "ai", "Python", "React", "roadmap"]
---


# AI Agent / Workflow / LLM Benchmark 系统化学习路线图
## 基于你的 Learning Skills 的完整实施方案

**制定日期**: 2026-01-07
**执行周期**: 12 周（3 个月）
**学习预算**: 每周 10-15 小时

---

## 🎯 路线图设计理念

本路线图整合了你所有的 learning skills：

| Skill | 应用场景 |
|-------|---------|
| **master-complex-domain** | 主线结构（6 阶段递进） |
| **layer-learning-roadmap** | 理解深度（黑箱→白箱→原理） |
| **tech-zero-to-one** | 知识架构（5 层递进） |
| **problem-driven-deep-dive** | 问题导向（实际场景驱动） |
| **ai-app-maturity-2026** | 行业洞察（2026 年趋势） |

---

## 📊 完整学习路径概览

```
第 1-2 周    第 3-5 周      第 6-8 周        第 9-12 周
知识索引    黑箱实践      白箱深入        原理精通
  ↓           ↓             ↓                ↓
[建立地图] → [跑通系统] → [理解机制] → [预测行为]
                  ↓
        能用 → 能懂 → 能实现 → 能优化
```

---

## Part 0: 目标锚定（Week 0，0.5 天）

> 使用 **master-complex-domain** 的第 0 阶段：目标锚定

### 🎯 你的具体目标

**问题驱动三问：**

1. **你要解决什么具体问题？**
   - [ ] 构建一个 AI Agent 产品（如客服代理、代码助手）
   - [ ] 设计一个 AI Workflow 系统（如自动化工作流）
   - [ ] 建立 LLM 评测体系（如 benchmark、排行榜）
   - [ ] 其他：_______________

2. **3 周后，你要能完成哪个可演示任务？**
   - 示例：部署一个能回答用户问题的客服 Agent
   - 示例：搭建一个多步骤的文档生成 Workflow
   - 示例：运行 MMLU/GSM8K benchmark 并分析结果

3. **这个领域 80% 场景下，最核心的 20% 是什么？**
   - AI Agent：规划 + 工具调用 + 记忆
   - AI Workflow：编排 + 状态管理 + 错误处理
   - LLM Benchmark：数据集 + 评估指标 + 基线模型

### 📋 建立"问题-知识"映射

| 问题场景 | 需要的概念 | 优先级 | 学习路径 |
|---------|-----------|--------|---------|
| 示例：客服 Agent 会答非所问 | RAG、Guardrails | P0 | Week 3-4 |
| 示例：Agent 无法调用工具 | Function Calling | P0 | Week 4-5 |
| 示例：Workflow 容易中断 | 状态管理、重试机制 | P1 | Week 6-7 |
| 示例：不知道哪个模型更好 | Benchmark 对比 | P1 | Week 8-9 |

### ⏱️ 设定"止损失限"

- **时间预算**：____ 小时/周（建议 10-15 小时）
- **深度边界**：达到"能用"即停，不追求"完全理解"
- **学习范围**：聚焦核心 20%，边缘知识用到再查

---

## Part 1: 压缩编码（Week 1，知识索引）

> 使用 **master-complex-domain** 的第 1 阶段 + **tech-zero-to-one** 的 5 层架构

### 🗺️ AI Agent / Workflow / LLM Benchmark 知识地形图

```
           [高价值+高频] → 核心区（深度学习）
                  │
  [低价值+高频] ──┼── [高价值+低频] → 深入区（理解原理）
                  │
           [低价值+低频] → 查阅区（用到了再搜）
```

### 📚 三书目录对比法

找出该领域的 3 本经典资源，**只读目录**：

**推荐资源：**
1. **LangChain 官方文档**（https://python.langchain.com/）
2. **"AI Agents" 论文综述**（arXiv:2308.11432）
3. **"LLM Empirical Benchmark" 综述**（Papers with Code）

**用 Excel 对齐章节，标记重合度：**
- 重合 3 次 → 【核心支柱】（必须掌握）
- 重合 2 次 → 【重要概念】（理解即可）
- 重合 1 次 → 【边缘知识】（用到再查）

### 📖 建立"黑话词典"（严格限制 30 个词）

快速扫读 3 篇综述文章，圈出所有陌生术语。

**每个词只记 3 样：**
```
术语：Agent
一句话定义：能自主感知环境并采取行动以实现目标的系统
典型场景：客服机器人、代码助手
它不是什么：不是简单的 Chatbot（无记忆、无工具）
```

**核心 30 词清单（AI Agent 方向）：**
1. Agent vs Chatbot
2. ReAct (Reasoning + Acting)
3. Function Calling
4. Tool Use
5. Memory (Short/Long term)
6. RAG (Retrieval-Augmented Generation)
7. Vector Database
8. Embedding
9. Chunking Strategy
10. Guardrails
11. Hallucination
12. Chain-of-Thought
13. Planning (Hierarchical)
14. Execution Engine
15. State Machine
16. Workflow Orchestration
17. LangChain / LangGraph
18. CrewAI / AutoGPT
19. Multi-Agent System
20. Human-in-the-Loop
21. Benchmark
22. MMLU / GSM8K / HumanEval
23. Zero-shot / Few-shot
24. Fine-tuning vs RAG
25. Prompt Engineering
26. Context Window
27. Token Limit
28. Temperature / Top-p
29. System Prompt
30. Evaluation Metrics

### 🎯 Week 1 输出指标

- [ ] **压缩版知识地图**（A4 纸 1 页）
- [ ] **30 词黑话词典**（每个词≤30 字）
- [ ] **3 个核心支柱**（用不同颜色标注）

**AI Agent 的 3 个核心支柱：**
1. **Planning（规划）**：分解复杂任务
2. **Tool Use（工具调用）**：调用外部 API
3. **Memory（记忆）**：存储和检索信息

**AI Workflow 的 3 个核心支柱：**
1. **Orchestration（编排）**：定义步骤和依赖
2. **State Management（状态管理）**：维护上下文
3. **Error Handling（错误处理）**：重试和回滚

**LLM Benchmark 的 3 个核心支柱：**
1. **Dataset（数据集）**：MMLU/GSM8K/HumanEval
2. **Metrics（指标）**：Accuracy/F1/Pass@k
3. **Baselines（基线）**：GPT-4/Claude/Llama

---

## Part 2: 建立信号通路（Week 2-3，Hello World）

> 使用 **master-complex-domain** 的第 2 阶段 + **layer-learning-roadmap** 的 Part 1（黑箱阶段）

### 🎯 Week 2-3 目标

打通"I→O"的主流程，**不带任何异常处理**。

### 📋 Day-by-Day 计划

#### Week 2: AI Agent Hello World

**Day 8-9：环境搭建**
```bash
# 1. 安装 LangChain
pip install langchain langchain-openai langchain-community

# 2. 获取 API Key
export OPENAI_API_KEY="sk-..."
# 或使用 Anthropic Claude
export ANTHROPIC_API_KEY="sk-..."

# 3. 创建第一个 Agent
python hello_agent.py
```

**hello_agent.py：**
```python
from langchain.agents import create_openai_functions_agent, AgentExecutor
from langchain.tools import Tool
from langchain_openai import ChatOpenAI
from langchain import hub

# 定义工具
def search_tool(query: str) -> str:
    """搜索工具（示例）"""
    return f"搜索结果：{query}"

tools = [
    Tool(
        name="Search",
        func=search_tool,
        description="用于搜索最新信息"
    )
]

# 创建 LLM
llm = ChatOpenAI(model="gpt-4o", temperature=0)

# 获取 prompt 模板
prompt = hub.pull("hwchase17/openai-functions-agent")

# 创建 agent
agent = create_openai_functions_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# 测试
result = agent_executor.invoke({"input": "搜索今天的天气"})
print(result)
```

**Day 10-11：跑通 ReAct 模式**
```python
# ReAct = Reasoning + Acting
from langchain.agents import create_react_agent

prompt = hub.pull("hwchase17/react")

agent = create_react_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

result = agent_executor.invoke({
    "input": "帮我查一下今天的天气，然后决定要不要带伞"
})
```

**Day 12-14：添加记忆**
```python
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain

# 短期记忆
memory = ConversationBufferMemory()

conversation = ConversationChain(
    llm=llm,
    memory=memory,
    verbose=True
)

# 测试记忆
conversation.predict(input="我叫张三")
conversation.predict(input="我叫什么名字？")
```

#### Week 3: AI Workflow Hello World

**Day 15-17：LangChain Chain**
```python
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate

# 定义 prompt 模板
prompt = PromptTemplate(
    input_variables=["topic"],
    template="写一篇关于{topic}的短文，100字左右。"
)

# 创建 chain
chain = LLMChain(llm=llm, prompt=prompt)

# 执行
result = chain.run(topic="AI Agent")
print(result)
```

**Day 18-19：LangGraph 状态机**
```python
from langgraph.graph import StateGraph, END

# 定义状态
class AgentState(dict):
    pass

# 定义节点
def research_node(state):
    # 研究步骤
    state["research"] = "研究结果"
    return state

def writing_node(state):
    # 写作步骤
    state["draft"] = "草稿"
    return state

# 构建图
workflow = StateGraph(AgentState)
workflow.add_node("research", research_node)
workflow.add_node("writing", writing_node)

workflow.add_edge("research", "writing")
workflow.add_edge("writing", END)

workflow.set_entry_point("research")

app = workflow.compile()

# 执行
result = app.invoke({})
```

**Day 20-21：LLM Benchmark Hello World**

**运行 MMLU benchmark：**
```bash
# 安装 evals
pip install evals

# 下载 MMLU 数据集
git clone https://github.com/hendrycks/test.git
cd test

# 运行 benchmark
python evaluate_mmlu.py \
  --data_dir data \
  --model_name gpt-4 \
  --num_few_shot 5
```

**解读结果：**
```
Subject              Accuracy    N
─────────────────────────────────
Mathematics          85.2%       100
Physics              78.3%       100
Computer Science     92.1%       100
─────────────────────────────────
Average              85.2%       100
```

### 🎯 Week 2-3 输出指标

- [ ] 跑通第一个 AI Agent（ReAct 模式）
- [ ] 跑通第一个 Workflow（LangGraph）
- [ ] 运行一个 LLM Benchmark（MMLU 或 GSM8K）
- [ ] 理解 I/O 流程（输入→处理→输出）

---

## Part 3: 解调分析（Week 4-6，理解机制）

> 使用 **master-complex-domain** 的第 3 阶段 + **layer-learning-roadmap** 的 Part 2（白箱阶段，5 种方法）

### 🎯 Week 4-6 目标

通过 5 种白箱方法，深入理解 Agent/Workflow/Benchmark 的核心机制。

### 📊 白箱方法工具箱

#### 方法 1：删层实验（证明必要性）
**实验：去掉 Memory 会怎样？**

```python
# 无 Memory 的 Agent
agent_no_memory = create_react_agent(llm, tools, prompt)

# 有 Memory 的 Agent
agent_with_memory = create_react_agent(llm, tools, prompt)
memory = ConversationBufferMemory()
agent_with_memory.memory = memory

# 对比测试
test_query = "先搜索天气，然后搜索明天，最后对比两者的温度"

result_no_memory = agent_no_memory.invoke({"input": test_query})
result_with_memory = agent_with_memory.invoke({"input": test_query})

# 结论：Memory 对于多步骤任务至关重要
```

#### 方法 2：替换实验（证明充分性）
**实验：替换 LLM 模型**

```python
models = {
    "gpt-4o": ChatOpenAI(model="gpt-4o"),
    "gpt-4o-mini": ChatOpenAI(model="gpt-4o-mini"),
    "claude-3-5-sonnet": ChatAnthropic(model="claude-3-5-sonnet-20241022")
}

for name, llm in models.items():
    agent = create_react_agent(llm, tools, prompt)
    result = agent.invoke({"input": test_query})
    print(f"{name}: {result}")
```

#### 方法 3：对比实验（理解差异）
**实验：Agent vs Chain**

```python
# Agent（自主决策）
agent_result = agent.invoke({"input": "帮我查天气然后决定要不要带伞"})

# Chain（固定流程）
chain = LLMChain(
    llm=llm,
    prompt=PromptTemplate(
        template="步骤1：查天气\n步骤2：决定带伞\n\n{input}"
    )
)
chain_result = chain.run("帮我查天气然后决定要不要带伞")

# 对比：Agent 更灵活，Chain 更可控
```

#### 方法 4：追踪实验（理解机制）
**实验：追踪 Agent 的思考过程**

```python
from langchain.callbacks import StdOutCallbackHandler

agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,  # 打印思考过程
    callbacks=[StdOutCallbackHandler()]
)

# 观察输出
# > Entering new AgentExecutor chain...
# > Action: Search
# > Action Input: 今天天气
# > Observation: 晴天，25度
# > Thought: 我现在知道最终答案了
# > Final Answer: 今天是晴天，25度，不需要带伞
```

#### 方法 5：破坏实验（理解边界）
**实验：极限测试**

```python
# 测试 1：超过 Context Window
long_text = "..." * 100000  # 超长文本
agent.invoke({"input": long_text})

# 测试 2：循环依赖
agent.invoke({"input": "一直搜索，直到找到答案"})

# 测试 3：工具不存在
agent.invoke({"input": "使用不存在的工具"})

# 结论：Agent 的边界在哪里
```

### 🔬 Week 4-6 实验清单

**Week 4：删层 + 替换实验**
- [ ] 去掉 Memory，观察影响
- [ ] 替换不同的 LLM，对比性能
- [ ] 替换不同的工具，观察适应性

**Week 5：对比 + 追踪实验**
- [ ] Agent vs Chain vs Workflow
- [ ] 追踪 Agent 的完整思考过程
- [ ] 对比不同 Prompt 策略

**Week 6：破坏实验**
- [ ] 测试 Context Window 边界
- [ ] 测试循环依赖
- [ ] 测试工具失效场景
- [ ] 建立"变化源矩阵"（识别隔离点）

### 📊 变化源矩阵

| 变化源 | 影响 | 隔离策略 | 测试方法 |
|-------|------|---------|---------|
| LLM 模型 | 输出质量 | 统一 LLM 接口 | 替换实验 |
| Prompt | 行为模式 | Prompt 模板管理 | 对比实验 |
| 工具 | 功能边界 | 工具抽象层 | 删层实验 |
| Memory | 上下文长度 | 分块存储 | 破坏实验 |
| 数据源 | 事实准确性 | RAG + 验证 | 追踪实验 |

### 🎯 Week 4-6 输出指标

- [ ] 完成 5 类白箱实验
- [ ] 理解每个组件的必要性
- [ ] 建立"变化源矩阵"
- [ ] 能解释 Agent 的决策过程

---

## Part 4: 破坏测试（Week 7-8，找边界）

> 使用 **master-complex-domain** 的第 4 阶段

### 🎯 Week 7-8 目标

通过 3 级破坏测试，找到系统的边界和脆弱点。

### 📋 破坏测试框架

#### Level 1：单点破坏（Single Point）

**测试 1：工具失效**
```python
def broken_tool(query: str) -> str:
    raise Exception("工具不可用")

# 观察 Agent 如何处理
agent = create_react_agent(llm, [
    Tool(name="BrokenTool", func=broken_tool, description="...")
], prompt)
agent.invoke({"input": "使用 BrokenTool"})
```

**测试 2：LLM 超时**
```python
llm = ChatOpenAI(model="gpt-4o", timeout=0.001)  # 极短超时
agent = create_react_agent(llm, tools, prompt)
agent.invoke({"input": "正常查询"})
```

**测试 3：记忆溢出**
```python
memory = ConversationBufferMemory()
for i in range(100000):
    memory.chat_memory.add_user_message(f"消息 {i}")
# 观察何时崩溃
```

#### Level 2：组合破坏（Combination）

**测试 4：工具失效 + LLM 幻觉**
```python
tools = [
    Tool(name="BrokenTool", func=broken_tool, description="返回虚假信息")
]
agent.invoke({"input": "查询不存在的功能"})
```

**测试 5：并发冲突**
```python
import asyncio

async def concurrent_query(agent, query):
    return await agent.ainvoke({"input": query})

tasks = [concurrent_query(agent, f"查询 {i}") for i in range(100)]
results = await asyncio.gather(*tasks)
```

#### Level 3：压力破坏（Stress）

**测试 6：大规模并发**
```python
from locust import HttpUser, task

class AgentUser(HttpUser):
    @task
    def query_agent(self):
        response = self.client.post("/agent", json={"query": "测试"})
```

**测试 7：长时间运行**
```python
# 运行 24 小时，观察内存泄漏
import time
start_time = time.time()
while time.time() - start_time < 86400:
    agent.invoke({"input": "测试查询"})
    time.sleep(10)
```

### 🛡️ 建立防御机制

**防御 1：工具层**
```python
def safe_tool_wrapper(func):
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            return f"工具调用失败: {str(e)}"
    return wrapper

tools = [
    Tool(
        name="SafeSearch",
        func=safe_tool_wrapper(search_tool),
        description="..."
    )
]
```

**防御 2：LLM 层**
```python
from langchain.callbacks import BaseCallbackHandler

class TimeoutHandler(BaseCallbackHandler):
    def on_llm_start(self, prompts, **kwargs):
        self.start_time = time.time()

    def on_llm_end(self, response, **kwargs):
        elapsed = time.time() - self.start_time
        if elapsed > 10:  # 10 秒超时
            raise TimeoutError("LLM 响应超时")
```

**防御 3：架构层**
```python
# Circuit Breaker 模式
from pybreaker import CircuitBreaker

breaker = CircuitBreaker(
    fail_max=5,
    timeout_duration=60
)

@breaker
def call_agent(query):
    return agent.invoke({"input": query})
```

### 🎯 Week 7-8 输出指标

- [ ] 完成 3 级破坏测试
- [ ] 识别系统的 10 个边界点
- [ ] 建立 3 层防御机制
- [ ] 记录所有失败模式

---

## Part 5: LLM Benchmark 深入（Week 9-10）

> 使用 **tech-zero-to-one** 的 5 层架构理解 Benchmark

### 🎯 Week 9-10 目标

深入理解 LLM Benchmark 的原理、数据集、指标、基线。

### 📚 第一层：核心问题（为什么需要 Benchmark？）

**传统方案的问题：**
- 主观评价：靠人感觉，不可重复
- 纸上测试：不反映真实场景
- 单一任务：无法全面评估

**Benchmark 的价值：**
- 标准化数据集
- 可复现的评估流程
- 公平的对比平台

### ⚠️ 第二层：技术挑战（为什么难？）

**挑战 1：数据集偏差**
- 训练数据污染（模型见过测试题）
- 分布偏移（测试分布 vs 真实分布）

**挑战 2：指标设计**
- Accuracy 不够（多选题 vs 生成题）
- F1-score 不适用（开放域生成）

**挑战 3：基线漂移**
- 新模型不断出现
- 基线很快过时

### 🛠️ 第三层：解决方案（核心技术）

**模块 1：数据集构建**

| 数据集 | 类型 | 规模 | 评估能力 |
|-------|------|------|---------|
| **MMLU** | 多选题 | 57 个学科，14K 题 | 知识广度 |
| **GSM8K** | 数学题 | 8.5K 题 | 数学推理 |
| **HumanEval** | 代码生成 | 164 题 | 编程能力 |
| **TruthfulQA** | 事实判断 | 817 题 | 真实性 |
| **BBH** | 推理任务 | 27 个任务 | BigBench Hard |

**模块 2：评估指标**

```python
# Accuracy（准确率）
def accuracy(predictions, labels):
    return sum(p == l for p, l in zip(predictions, labels)) / len(labels)

# F1-score
from sklearn.metrics import f1_score

# Pass@k（代码生成）
def pass_at_k(n, c, k):
    """
    n: 总样本数
    c: 通过样本数
    k: 尝试次数
    """
    return 1 - (comb(n - c, k) / comb(n, k))

# BLEU（文本相似度）
from nltk.translate.bleu_score import sentence_bleu
```

**模块 3：基线模型**

```python
baselines = {
    "gpt-4o": OpenAI(model="gpt-4o"),
    "claude-3-5-sonnet": Anthropic(model="claude-3-5-sonnet-20241022"),
    "llama-3-70b": Local(model="meta-llama/Llama-3-70b")
}
```

### 🔄 第四层：完整工作流程

**Step 1：准备数据集**
```bash
# 下载 MMLU
wget https://people.eecs.berkeley.edu/~hendrycks/data.tar

# 解压
tar -xf data.tar
```

**Step 2：运行评估**
```python
from evals import MMLUEvaluator

evaluator = MMLUEvaluator(
    data_path="data/mmlu",
    model=llm,
    num_few_shot=5
)

results = evaluator.evaluate()
print(results)
```

**Step 3：分析结果**
```python
import matplotlib.pyplot as plt

subjects = list(results.keys())
scores = list(results.values())

plt.bar(subjects, scores)
plt.xlabel("Subject")
plt.ylabel("Accuracy")
plt.title("MMLU Results")
plt.show()
```

### 🎯 第五层：典型应用场景

**场景 1：模型选型**
```python
# 对比 3 个模型
for model_name, model in baselines.items():
    results = evaluate(model, mmlu_data)
    print(f"{model_name}: {results['average']}")
```

**场景 2：Prompt 优化**
```python
prompts = [
    "直接回答",
    "Let's think step by step",
    "First, analyze the problem. Then, solve it."
]

for prompt in prompts:
    results = evaluate_with_prompt(llm, mmlu_data, prompt)
    print(f"{prompt}: {results['average']}")
```

**场景 3：A/B 测试**
```python
# 对比两个版本的 Agent
agent_v1 = create_agent_v1()
agent_v2 = create_agent_v2()

results_v1 = evaluate_agent(agent_v1, test_cases)
results_v2 = evaluate_agent(agent_v2, test_cases)

print(f"v1: {results_v1}, v2: {results_v2}")
```

### 🎯 Week 9-10 输出指标

- [ ] 运行 3 个 Benchmark（MMLU、GSM8K、HumanEval）
- [ ] 理解核心评估指标
- [ ] 对比 3 个基线模型
- [ ] 建立 Benchmark 分析报告

---

## Part 6: 实战项目（Week 11-12）

> 整合所有知识，构建一个完整的 AI Agent/Workflow 产品

### 🎯 Week 11-12 目标

从 0 到 1 构建一个可演示的 AI Agent 产品。

### 📋 项目清单

**选择一个项目：**

- [ ] **项目 A**：智能客服 Agent（支持 RAG + 工具调用）
- [ ] **项目 B**：文档生成 Workflow（多步骤协作）
- [ ] **项目 C**：代码审查 Agent（静态分析 + LLM）
- [ ] **项目 D**：自定义 Benchmark 系统

### 🚀 Week 11：开发

**Day 1-2：架构设计**
```python
# 绘制系统架构图
"""
┌─────────────────────────────────────┐
│           User Interface            │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Agent Orchestrator          │
│  (LangChain / LangGraph)            │
└──────┬────────────────┬─────────────┘
       │                │
┌──────▼──────┐  ┌─────▼─────────┐
│    RAG      │  │  Tool Caller  │
│  (Knowledge)│  │  (API / DB)   │
└─────────────┘  └───────────────┘
"""
```

**Day 3-5：核心功能实现**
```python
# 1. RAG 系统
from langchain.vectorstores import Pinecone
from langchain.embeddings import OpenAIEmbeddings

vectorstore = Pinecone.from_documents(
    documents,
    embedding=OpenAIEmbeddings()
)

# 2. 工具定义
tools = [
    Tool(name="查询订单", func=query_order, description="..."),
    Tool(name="退款处理", func=process_refund, description="..."),
    Tool(name="人工转接", func=transfer_to_human, description="...")
]

# 3. Agent 创建
agent = create_openai_functions_agent(llm, tools, prompt)
```

**Day 6-7：测试与优化**
```python
# 测试用例
test_cases = [
    "查询订单 12345",
    "退款订单 12345",
    "投诉产品质量",
    "转人工客服"
]

for query in test_cases:
    result = agent.invoke({"input": query})
    print(f"Query: {query}\nResult: {result}\n")
```

### 📊 Week 12：部署与评估

**Day 1-3：部署**
```bash
# 1. 容器化
cat > Dockerfile <<EOF
FROM python:3.11
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]
EOF

# 2. 本地测试
docker build -t ai-agent .
docker run -p 8000:8000 ai-agent

# 3. 云端部署（可选）
# 使用 Streamlit Cloud / Hugging Face Spaces
```

**Day 4-5：评估**
```python
# 自定义 Benchmark
evaluator = AgentEvaluator(
    test_cases=100,
    metrics=["accuracy", "response_time", "user_satisfaction"]
)

results = evaluator.evaluate(agent)

# 对比基线
baseline_results = evaluate_baseline()

print(f"Agent: {results['accuracy']}")
print(f"Baseline: {baseline_results['accuracy']}")
print(f"Improvement: {results['accuracy'] - baseline_results['accuracy']}")
```

**Day 6-7：文档与演示**
```markdown
# 项目文档

## 功能特性
- ✅ RAG 知识检索
- ✅ 工具调用
- ✅ 多轮对话
- ✅ 人工转接

## 技术栈
- LangChain
- Pinecone
- OpenAI GPT-4o

## 性能指标
- 准确率: 85%
- 响应时间: 2s
- 用户满意度: 4.5/5

## 在线演示
[视频 / Demo]
```

### 🎯 Week 11-12 输出指标

- [ ] 完成一个完整的 AI Agent 产品
- [ ] 部署到线上（可访问）
- [ ] 通过 100 个测试用例
- [ ] 编写完整文档
- [ ] 录制演示视频（5 分钟）

---

## 🎓 学习资源推荐

### 📚 必读书籍

1. **《AI Agent 理论与实践》**
   - 作者：未出版（建议阅读论文综述）
   - 替代：arXiv:2308.11432 "AI Agents: A Comprehensive Survey"

2. **《LangChain 实战》**
   - 在线文档：https://python.langchain.com/
   - 推荐章节：Agents、Chains、Memory

3. **《LLM Benchmark 评测方法》**
   - Papers with Code：https://paperswithcode.com/
   - 推荐数据集：MMLU、GSM8K、HumanEval

### 🌐 在线资源

**课程：**
- LangChain Academy：https://academy.langchain.com/
- Andrew Ng AI Agent 课程：https://www.deeplearning.ai/short-courses/

**博客：**
- Lil' Log：https://lilianweng.github.io/
- Jay Alammar：https://jalammar.github.io/

**社区：**
- LangChain Discord：https://discord.gg/langchain
- Reddit r/LocalLLaMA：https://reddit.com/r/LocalLLaMA

### 🛠️ 工具清单

| 类别 | 推荐工具 | 用途 |
|------|---------|------|
| **Agent 框架** | LangChain, LangGraph | 构建 Agent |
| **向量数据库** | Pinecone, Weaviate | RAG 知识库 |
| **Benchmark** | evals, Promptfoo | 评估测试 |
| **监控** | LangSmith, Weights & Biases | 可观测性 |
| **部署** | Streamlit, FastAPI | 产品化 |

---

## 📊 每周检查清单

### Week 1-2：基础建设
- [ ] 建立学习文件夹
- [ ] 完成 30 词黑话词典
- [ ] 跑通 Hello World

### Week 3-4：实践入门
- [ ] 完成 ReAct Agent
- [ ] 完成 LangGraph Workflow
- [ ] 运行 MMLU Benchmark

### Week 5-6：深入理解
- [ ] 完成 5 类白箱实验
- [ ] 建立变化源矩阵
- [ ] 能解释 Agent 决策过程

### Week 7-8：边界测试
- [ ] 完成 3 级破坏测试
- [ ] 建立 3 层防御机制
- [ ] 记录所有失败模式

### Week 9-10：Benchmark 专题
- [ ] 运行 3 个 Benchmark
- [ ] 理解评估指标
- [ ] 对比基线模型

### Week 11-12：实战项目
- [ ] 完成完整产品
- [ ] 部署到线上
- [ ] 通过 100 个测试用例

---

## 🎯 成功标准

### 3 个月后的你

**知识掌握：**
- ✅ 能解释 AI Agent 的核心原理
- ✅ 能设计 AI Workflow 系统
- ✅ 能运行和解读 LLM Benchmark

**实战能力：**
- ✅ 能独立构建一个 AI Agent 产品
- ✅ 能优化 Agent 性能
- ✅ 能评估模型表现

**职业发展：**
- ✅ 能胜任 AI 应用开发工程师
- ✅ 能进行 AI 产品技术选型
- ✅ 能撰写技术博客和分享

---

## 🚀 立即开始

### 今天就可以做的 3 件事

1. **设置环境（10 分钟）**
   ```bash
   pip install langchain langchain-openai
   export OPENAI_API_KEY="sk-..."
   ```

2. **跑通 Hello World（20 分钟）**
   ```python
   from langchain_openai import ChatOpenAI
   llm = ChatOpenAI(model="gpt-4o")
   print(llm.invoke("Hello, AI Agent!"))
   ```

3. **制定学习计划（10 分钟）**
   - 在日历上标记每周学习时间
   - 加入 LangChain Discord 社区
   - 找一个学习伙伴（可选）

---

**最后的话：**

AI Agent / Workflow / LLM Benchmark 是一个快速发展的领域。**核心不是记住所有工具，而是理解底层原理**。

这套路线图给你的是：
1. **系统化的学习路径**（从 0 到 1）
2. **可执行的实验方法**（白箱 5 法）
3. **真实的项目经验**（完整产品）

**3 个月后，你会从"完全不懂"到"能独立开发 AI Agent 产品"。**

**现在就开始吧！最好的时间是现在。**

---

**文档版本**: v1.0
**执行开始日期**: ____年__月__日
**预计完成日期**: ____年__月__日

**执行人签名**: ____________
