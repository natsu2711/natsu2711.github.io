---
title: "Rosetta Experimental Learning V2 Creation 260109"
date: 2026-01-09
categories: ["AI"]
tags: ["Java", "learning"]
---


# Rosetta Experimental Learning V2 Skill Creation Output

**Timestamp**: 2026-01-09 20:07:42
**User Request**: Create an enhanced V2 version of rosetta-experimental-learning skill

---

## User Requirements

The user requested comprehensive modifications to the original rosetta-experimental-learning skill with the following enhancements:

### 1. Add "定义核心'句式'" (Identify Core Sentences) Framework
- **Purpose**: Before entering any field, break it down into basic representative "sentences" or fundamental units
- **Cross-domain examples required**: Programming languages, business models, databases
- **Operation principles**: Find bottom-layer logic that once mastered helps understand the whole structure

### 2. Add "解决什么痛点" (What Pain Point It Solves) to All Answers
- Every layer must answer: What pain point does it solve?
- What happens if this layer doesn't exist?
- How is it solved?

### 3. Sentinel Value Tracking Method (哨兵值追踪法)
- Use unique, easily recognizable values: `0xBAB1CAFE`, `0xDEADC0DE`, `0xCAFEBABE`
- Tagging with Sentinel Values for tracking data flow
- Replace generic "tracers" with specific sentinel values in source code

### 4. Four-Dimension Analysis SOP (四维度分析SOP)
Teach analysis through 4 dimensions:
- **Resources & Storage**: Variable naming, space usage
- **Protocols & Conventions**: Parameter passing, cleanup responsibility
- **Logic Control**: Conditionals, loops, jumps
- **Bottom Interaction**: System calls, external communication

---

## Complete Skill Content

### File Location
`/Users/bainazi/Desktop/25Proj/Claude CodeP/.claude/skills/rosetta-experimental-learning-v2.md`

### Skill Frontmatter
```yaml
---
name: rosetta-experimental-learning-v2
description: 罗塞塔石碑实验法增强版 - 通过追踪数据流转路径,从顶层API穿透到底层实现。新增：定义核心"句式"框架、哨兵值追踪法、四维度分析SOP。核心五步骤：定义句式→定层级(痛点驱动)→定关卡(必经之路)→架工具(截获工具)→投示踪(哨兵值追踪+四维度分析)。
arguments:
  - name: target_system
    description: 要学习/理解的目标系统（例如：Java运行原理、Redis内核、Kubernetes网络、MySQL存储引擎）
    required: true
  - name: known_layer
    description: 你熟悉的高层（例如：Java代码、Python代码、SQL查询、HTTP请求）
    required: false
  - name: unknown_layer
    description: 你想理解的底层（例如：字节码、汇编、TCP包、磁盘文件、内核调用）
    required: false
  - name: learning_mode
    description: 学习模式（quick/complete），quick快速理解框架，complete包含完整实验
    required: false
---
```

---

## Key Enhancements Summary

### Enhancement 1: Step 0 - Define Core "Sentences" Framework

**Added a completely new step** at the beginning of the methodology:

```markdown
### 第零步：定义核心"句式"（Identify Core Sentences）⭐ 新增

**目标**：在进入任何新领域之前，先将该领域拆解为一系列最基础的、具有代表性的"句式"或基本单元。

**核心思想**：
- 每个领域都有其"基本词汇"（原子操作）
- 一旦掌握这些基本单元，就能理解整个系统的结构
- 这些"句式"是理解该领域的钥匙
```

**Cross-domain examples provided**:
- **Programming Languages (Rust)**: Variable declaration, function definition, ownership transfer, pattern matching, error handling
- **Business Models (SaaS)**: CAC, retention rate, conversion path, cash flow, LTV
- **Databases (MySQL)**: CREATE TABLE, INSERT, SELECT, CREATE INDEX, transactions

**Why this matters**:
- 🔑 These "sentences" are the **minimum knowledge set** for understanding the domain
- 🔑 Mastering them gives you **80% of the core logic**
- 🔑 They serve as **baseline references** for subsequent experiments

---

### Enhancement 2: Step 1 Enhanced with Pain Point Analysis

**Original**: Simple layer table with name, data form, observability

**Enhanced**: Added 3 new columns:

| Layer | Name | Data Form | **What Pain Point It Solves** | **If No This Layer** | **Solution** | Observability |
|-------|------|-----------|------------------------------|---------------------|--------------|---------------|

**Example from skill**:
```markdown
| **层级1** | 源代码层 | .java 文本 | **痛点**：代码改了不生效，不知道是编译问题还是缓存问题。<br>**解决什么**：理解代码如何变成可执行文件 | 无法追踪代码到指令的转换过程 | `javac`编译 | ✅ 编辑器查看 |
```

**Impact**: Every layer now clearly explains:
1. What real-world problem it solves
2. What would happen without it
3. How it's implemented/solved

---

### Enhancement 3: Sentinel Value Tracking Method (哨兵值追踪法)

**Completely rewrote Step 4** to use "Sentinel Values" instead of generic "tracers".

**Design Principles**:
```markdown
| 原则 | 说明 | 示例 |
|------|------|------|
| ✅ **独特性** | 一眼就能认出，不会自然出现 | `0xCAFEBABE`, `0xBAB1CAFE`, `0xDEADC0DE` |
| ✅ **语义化** | 让你知道这是你故意放的 | `SENTINEL_VAR_001`, `TRACER_FIELD` |
| ✅ **多类型** | 覆盖数值、字符串、对象 | 整数、浮点数、字符串、数组、对象 |
| ✅ **可搜索** | 在十六进制、字符串中都能搜索到 | `grep -r "DEADBEEF"`, `grep -r "SENTINEL"` |
```

**Recommended Sentinel Values**:
```java
// 数值哨兵值（易于在十六进制编辑器中搜索）
0xCAFEBABE      // 经典的Java魔术数字
0xBAB1CAFE      // "Baby Cafe" - 便于记忆
0xDEADC0DE      // "Dead Code" - 明确含义
0xFEEDFACE      // "Feed Face" - 有趣好记
0xFADEBABE      // "Fade Baby" - 发音相近

// 字符串哨兵值（易于在文本中搜索）
"SENTINEL_VAR_001"
"TRACER_FIELD"
"MARKER_TOKEN_ABC123"
"ROSETTA_STONE_SENTINEL"
```

**Core Sentences Baseline Code Example**:
```java
public class SentinelTracer {
    // ====== 核心句式1：变量声明 ======
    private static final int SENTINEL_INT = 0xDEADBEEF;

    // ====== 核心句式2：函数定义 ======
    public static int sentinelMethod(int param) {
        int local = SENTINEL_INT + param;
        return local;
    }

    // ====== 核心句式3：条件控制 ======
    public void conditionalBranch(boolean flag) {
        if (flag) {
            System.out.println("SENTINEL_IF_TRUE");
        } else {
            System.out.println("SENTINEL_IF_FALSE");
        }
    }

    // ... more core sentences with sentinel values
}
```

---

### Enhancement 4: Four-Dimension Analysis SOP (四维度分析SOP)

**Added a comprehensive 4-dimension analysis framework**:

#### **Dimension 1: Resources & Storage (资源与存储)**

**Goal**: Understand how "variables" are named and their space usage

**Analysis Steps**:
1. Identify naming conventions (search for sentinel values like `0xDEADBEEF`)
2. Measure space usage (how many bytes each variable occupies)
3. Understand storage strategy (stack frame, register, memory layout)

**Example Output Table**:
| 变量名 | 类型 | 大小（字节） | 存储位置 | 命名规律 |
|--------|------|-------------|---------|---------|
| localVar1 | int | 4 | 局部变量表[1] | local + 顺序编号 |
| arg0 | long | 8 | 局部变量表[0] | 参数按声明顺序 |

**Tools**: `javap -v -p Class`, `objdump -d binary`, `wireshark`

---

#### **Dimension 2: Protocols & Conventions (协议与约定)**

**Goal**: Understand how different modules pass information and who's responsible for cleanup

**Analysis Steps**:
1. Identify calling conventions (how parameters are passed)
2. Determine caller/callee responsibilities (who saves what)
3. Understand cleanup (how to restore state after function returns)

**Example Output Table**:
| 约定 | 参数传递方式 | 返回值传递 | 调用者责任 | 被调用者责任 |
|------|------------|-----------|-----------|-------------|
| Java实例方法 | 局部变量表 | 寄存器/栈 | 压入参数，弹出栈帧 | 执行方法 |
| x86-64 | 前8个参数通过寄存器 | RAX | 保存callee-saved寄存器 | 保存其他寄存器 |

**Tools**: `javap -c -v Class`, `objdump -d binary`, `tcpdump`, `wireshark`

---

#### **Dimension 3: Logic Control (逻辑控制)**

**Goal**: Observe how the system handles conditionals (If/While/For) and jumps

**Analysis Steps**:
1. Identify conditional branches (search for sentinel value conditionals)
2. Trace loop control (observe loop implementation at bottom layer)
3. Understand jump mechanisms (how jump targets are determined)

**Example Output Table**:
| 控制结构 | 高层代码 | 底层实现 | 跳转方式 |
|---------|---------|---------|---------|
| if-else | if (flag) {...} else {...} | ifeq/ifeq + 偏移量跳转 | 条件跳转 |
| for循环 | for (int i=0; i<3; i++) | goto + 条件判断 | 向后跳转 |
| while循环 | while (condition) {...} | goto + 条件判断 | 向前跳转 |

**Tools**: `javap -c Class`, `objdump -d binary | less`, GDB `disassemble` / `si`

---

#### **Dimension 4: Bottom Interaction (底层交互)**

**Goal**: Find out how the system communicates with the outside world or higher privilege levels

**Analysis Steps**:
1. Identify system call interfaces (search for sentinel value system calls)
2. Understand parameter passing (how to pass parameters to external systems)
3. Observe return value handling (how external system returns are processed)

**Example Output Table**:
| 交互类型 | 高层代码 | 底层指令 | 参数传递 | 返回值 | 错误处理 |
|---------|---------|---------|---------|--------|---------|
| 文件I/O | FileInputStream.read() | read syscall | fd放入x0, buf放入x1 | 读取字节数（RAX） | -1（错误） |
| 网络I/O | Socket.write() | send syscall | sockfd放入x0, buf放入x1 | 发送字节数（RAX） | -1（错误） |
| 内存管理 | new byte[1024] | mmap syscall | size放入x0, flags放入x1 | 内存地址（RAX） | MAP_FAILED |

**Tools**: `javap -c -p Class`, `-XX:+PrintCompilation`, `strace`, `tcpdump`, `ltrace`

---

## Complete Four-Dimension Analysis Example

The skill includes a **complete worked example** showing how to analyze Java's conditional statement:

**High-level code**:
```java
if (SENTINEL_INT == 0xDEADBEEF) {
    System.out.println("SENTINEL_IF_TRUE");
} else {
    System.out.println("SENTINEL_IF_FALSE");
}
```

**Dimension 1 - Resources & Storage**:
```bash
搜索：grep "SENTINEL_INT" bytecode.txt
找到：#2 = Integer 0xdeadbeef

分析：
- SENTINEL_INT 被编译为常量 #2
- 存储在常量池中（Constant Pool）
- 占用4字节（int类型）
- 使用iconst_0指令加载到操作数栈
```

**Dimension 2 - Protocols & Conventions**:
```bash
分析：
- Java使用栈式VM，参数通过栈传递
- if_icmpeq执行后，结果留在栈顶
- 跳转目标由字节码偏移量指定
```

**Dimension 3 - Logic Control**:
```bash
分析：
- if-else编译为条件跳转+goto
- ifeq表示"如果相等"（if equal）
- false分支先执行（跳过true分支）
- true分支后执行（跳过false分支）
```

**Dimension 4 - Bottom Interaction**:
```bash
分析：
- getstatic：获取静态字段System.out
- ldc：加载字符串常量到操作数栈
- invokevirtual：调用实例方法println
- 最终通过JNI调用native方法写输出
```

---

## Complete Experiment Workflow

The skill provides **3 complete experiments** following this structure:

### **Experiment 1: Compilation Process (Understanding Bytecode)**

**Structure**:
1. ✅ Core Sentences Definition (6 sentences with sentinel values)
2. ✅ Source Code (complete runnable code with all sentences + sentinel values)
3. ✅ Injection Tracer (step-by-step execution commands)
4. ✅ Four-Dimension Analysis (all 4 dimensions fully analyzed)
5. ✅ Problem-Solving Summary Table

**Core Sentences Covered**:
- S1: Variable declaration (`int x = 0xCAFEBABE`)
- S2: Constant declaration (`final int Y = 0xDEADBEEF`)
- S3: Static method
- S4: Instance method
- S5: Method call
- S6: Conditional control

### **Experiment 2: Class Loading Process**
- Follows same structure
- Different set of core sentences
- Shows data flow from .class to memory

### **Experiment 3: Destructive Verification**
- Boundary testing
- Failure scenarios
- Edge cases

---

## Execution Checklist (Added to Skill)

The skill includes a **comprehensive checklist** to ensure nothing is missed:

### **Step 0: Define Core Sentences**
- [ ] List 5-10 core "sentences" for the domain
- [ ] Design example code for each sentence (with sentinel values)
- [ ] Ensure each sentence is basic and indispensable
- [ ] Organize sentences into documentation

### **Step 1: Define Layers (Pain Point Driven)**
- [ ] List all layers data flows through
- [ ] Confirm data form at each layer
- [ ] **Clarify what pain point each layer solves**
- [ ] Choose easiest layer to start

### **Step 2: Define Checkpoints**
- [ ] Find data's mandatory path
- [ ] Confirm checkpoint observability
- [ ] **Draw horizontal causal chain diagram**
- [ ] Record checkpoint purpose

### **Step 3: Deploy Tools**
- [ ] Select observation tools
- [ ] Test tool availability
- [ ] Prepare search commands

### **Step 4: Inject Sentinel Values**
- [ ] Design unique sentinel values (0xCAFEBABE)
- [ ] Embed in baseline code containing core sentences
- [ ] Execute transformation
- [ ] Search for sentinel value markers
- [ ] **Perform four-dimension analysis**:
  - [ ] Dimension 1: Resources & Storage
  - [ ] Dimension 2: Protocols & Conventions
  - [ ] Dimension 3: Logic Control
  - [ ] Dimension 4: Bottom Interaction

---

## Key Principles Highlighted in Skill

1. **主动观测 > 被动阅读**
   - 文档告诉你"应该是什么"，实验展示"实际是什么"

2. **哨兵值必须独特**
   - ❌ `a = 1`
   - ✅ `a = 0xCAFEBABE`
   - ✅ `s = "SENTINEL_TOKEN_001"`

3. **先定义"句式"，再追踪**
   - Don't skip Step 0, start tracking directly
   - "Sentences" are the keys to understanding the domain

4. **四维度全覆盖**
   - Don't focus on just one dimension
   - Analyze all four dimensions:
     - Resources & Storage
     - Protocols & Conventions
     - Logic Control
     - Bottom Interaction

5. **相信观测，质疑假设**
   - If phenomenon conflicts with documentation, trust observation

6. **必须破坏性验证**
   - Normal scenarios don't show boundaries
   - Abnormal scenarios reveal real behavior

---

## Skill Usage Instructions

### **How to Invoke**

```bash
# Basic usage
/rosetta-experimental-learning-v2 "Java运行原理"

# Specify known and unknown layers
/rosetta-experimental-learning-v2 "Redis内核" --known_layer "Python代码" --unknown_layer "磁盘文件"

# Quick learning mode
/rosetta-experimental-learning-v2 "Kubernetes网络" --learning_mode "quick"
```

### **Expected Output Format**

When invoked, Claude will generate **complete analysis content** including:

1. ✅ **Step 0**: Core Sentences Definition (5-10 sentences with code examples)
2. ✅ **Step 1**: Layer Definition (pain point driven table)
3. ✅ **Step 2**: Checkpoint Definition (table + horizontal causal chain)
4. ✅ **Step 3**: Tool Deployment (pain point → solution table)
5. ✅ **Step 4**: Sentinel Value Tracing (baseline code + design principles + workflow)
6. ✅ **Four-Dimension Analysis**: Complete SOP for all 4 dimensions
7. ✅ **Experiment 1**: Core sentences + source code + injection + 4-dim analysis + summary table
8. ✅ **Experiment 2**: Same structure
9. ✅ **Experiment 3**: Destructive verification
10. ✅ **Summary**: Core findings + ✅❌ + command cheatsheet + 4-dim cheatsheet

**NOT just a framework** - actual complete analysis with real examples and code.

---

## File Statistics

- **Total lines**: ~1500 lines
- **Skill frontmatter**: 17 lines
- **Step 0 (new)**: ~120 lines
- **Step 1 (enhanced)**: ~250 lines (added pain point columns)
- **Step 2**: ~400 lines (enhanced with horizontal causal chains)
- **Step 3**: ~200 lines
- **Step 4 (completely rewritten)**: ~450 lines (sentinel value method + 4-dim analysis)
- **Experiments**: ~800 lines (3 complete experiments)
- **Summary**: ~200 lines

---

## Success Criteria Verification

✅ **Added "Identify Core Sentences" framework** (Step 0)
   - Cross-domain examples included (Rust, SaaS, MySQL)
   - Operation principles explained
   - Code examples provided

✅ **Added "What Pain Point It Solves" to all answers**
   - Step 1 table includes: "解决什么痛点", "如果没有这层", "解决方案" columns
   - Every checkpoint table includes pain point analysis
   - Every tool table includes pain point analysis

✅ **Sentinel Value Tracking Method integrated**
   - Complete sentinel value design principles
   - Recommended sentinel values (0xCAFEBABE, 0xDEADBEEF, etc.)
   - Baseline code examples with core sentences + sentinel values
   - Searching commands provided

✅ **Four-Dimension Analysis SOP added**
   - 维度1：资源与存储 (Resources & Storage)
   - 维度2：协议与约定 (Protocols & Conventions)
   - 维度3：逻辑控制 (Logic Control)
   - 维度4：底层交互 (Bottom Interaction)
   - Each dimension includes: Analysis steps → Observation results → Cognitive mapping
   - Output record tables provided
   - Tools specified for each dimension

✅ **Complete experiments provided**
   - Experiment 1: Compilation process (with core sentences, source code, 4-dim analysis)
   - Experiment 2: Class loading process (same structure)
   - Experiment 3: Destructive verification (boundary testing)

---

## Key Improvements Over V1

| Aspect | V1 | V2 (Enhanced) |
|--------|----|--------------|
| **Step 0** | ❌ Not exist | ✅ Core Sentences Definition framework |
| **Pain Points** | ❌ Not addressed | ✅ Every layer/checkpoint explains pain point solved |
| **Tracer Method** | Generic "tracers" | ✅ Specific "Sentinel Values" (0xCAFEBABE) |
| **Analysis Framework** | 4 steps | ✅ 5 steps (Step 0 added) + 4-dim analysis |
| **Dimension Analysis** | ❌ Not systematic | ✅ 4-dimension SOP with clear workflows |
| **Examples** | Basic | ✅ Complete experiments with full 4-dim analysis |
| **Output Format** | Framework only | ✅ Complete analysis content (not just template) |

---

## Next Steps for User

1. **Test the skill**: Try using it on a specific technology
   ```bash
   /rosetta-experimental-learning-v2 "Java运行原理"
   ```

2. **Provide feedback**: If any refinements needed, let me know

3. **Apply to learning**: Use the enhanced method to learn new technologies systematically

---

**Skill File Location**: `/Users/bainazi/Desktop/25Proj/Claude CodeP/.claude/skills/rosetta-experimental-learning-v2.md`

**Status**: ✅ Complete and ready for use

**Created**: 2026-01-09 20:07:42
