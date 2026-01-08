---
title: "Rapid Project Understanding Claude Code Router"
date: 2026-01-05
categories: ["AI"]
tags: ["ai"]
---


# 📊 Claude Code Router 项目分析报告

**使用Skill**: rapid-project-understanding
**项目来源**: https://github.com/musistudio/claude-code-router
**分析时间**: 2026-01-05
**分析深度**: standard (110分钟)

---

## 第1步：项目概况（找入口）

### 项目基本信息表

| 项目 | 说明 |
|------|------|
| **项目类型** | 中间件服务（API Router + CLI Tool + Web UI） |
| **核心功能** | 将Claude Code请求路由到其他LLM提供商，无需Anthropic账户 |
| **技术栈** | **TypeScript/Node.js** + Fastify + React + Vite |
| **架构模式** | Monorepo（pnpm workspaces） |
| **启动方式** | `npm install -g @musistudio/claude-code-router` → `ccr start` |
| **配置文件** | `~/.claude-code-router/config.json` |
| **核心价值** | 降低成本、绕过地理限制、灵活选择模型、保持Claude Code体验 |

### 一句话概括
**Claude Code Router是一个透明代理服务，拦截Claude Code的API请求并重定向到配置的替代提供商（如DeepSeek、OpenAI、Gemini），实现零摩擦的成本优化和模型自由切换。**

---

## 第2步：核心数据流（追链路）

### 核心流程1：`ccr code` - 启动Claude Code并路由请求

```
用户执行: ccr code
  ↓
【CLI解析】ccr code命令
  ├─ 文件：packages/cli/src/cli.ts
  ├─ 设置环境变量：
  │   ANTHROPIC_BASE_URL=http://localhost:3456/v1
  │   ANTHROPIC_API_KEY=ccr-router-key
  └─ 启动claude-code进程
  ↓
【Claude Code启动】
  └─ Claude Code读取环境变量
  ├─ 发现ANTHROPIC_BASE_URL指向本地服务
  └─ 所有API请求发送到 http://localhost:3456
  ↓
【Router接收请求】/v1/messages
  ├─ 文件：packages/server/src/server.ts
  ├─ Fastify服务器监听 :3456
  └─ 接收Claude Code的POST /v1/messages
  ↓
【智能路由】
  ├─ 文件：packages/server/src/utils/router.ts
  ├─ 分析请求特征：
  │   ├─ 任务类型？(editing/chat/command)
  │   ├─ 上下文长度？
  │   ├─ 项目特定配置？
  │   └─ 会话历史？
  └─ 选择最佳模型：
      ├─ 轻量任务 → Ollama (本地)
      ├─ 重度推理 → DeepSeek-R1
      ├─ 长上下文 → OpenRouter
      └─ 图片任务 → DALL-E 3
  ↓
【请求转换】
  ├─ 文件：packages/core/src/transformer/
  ├─ Anthropic格式 → 提供商格式
  │   ├─ 提取messages
  │   ├─ 转换API参数
  │   └─ 适配stream格式
  └─ 生成目标提供商请求
  ↓
【发送到提供商】
  ├─ HTTP POST到提供商API
  ├─ 携带API密钥（从配置读取）
  └─ SSE流式响应
  ↓
【响应转换】
  ├─ 文件：packages/core/src/utils/SSEParser.transform.ts
  ├─ 提供商格式 → Anthropic格式
  │   ├─ 解析SSE事件
  │   ├─ 转换delta格式
  │   └─ 适配tool_use格式
  └─ 生成标准Anthropic响应
  ↓
【返回给Claude Code】
  └─ Claude Code接收标准格式响应
      └─ 用户无感知（以为是Claude API）
```

**数据流关键节点**：
1. **CLI层** → 设置环境变量，启动Claude Code
2. **Server层** → Fastify服务器，接收请求
3. **Router层** → 智能模型选择
4. **Transformer层** → API格式转换
5. **Provider层** → 实际LLM调用
6. **SSE处理层** → 流式响应转换

---

### 核心流程2：智能路由决策

```
请求到达Router
  ↓
【步骤1】计算上下文长度
  ├─ 使用tiktoken计算token数
  └─ 判断：total_tokens > threshold?
  ↓
【步骤2】检查路由规则
  ├─ 路由类别：
  │   ├─ default（默认）
  │   ├─ background（后台任务）
  │   ├─ think（推理任务）
  │   ├─ longContext（长上下文）
  │   ├─ webSearch（搜索增强）
  │   └─ image（图片生成）
  └─ 选择匹配的模型
  ↓
【步骤3】检查会话缓存
  ├─ LRU缓存：相同会话复用模型
  └─ 避免频繁切换
  ↓
【步骤4】选择最终模型
  └─ 返回：provider + model配置
```

---

## 第3步：架构地图（画架构）

### Monorepo结构分析

```
claude-code-router/
├── packages/                    # Monorepo包结构
│   ├── cli/                    # ✅ P0：CLI工具
│   │   └── src/
│   │       ├── cli.ts           # CLI入口
│   │       ├── commands/        # 命令实现
│   │       │   ├── start.ts     # 启动服务
│   │       │   ├── stop.ts      # 停止服务
│   │       │   ├── code.ts      # ✅ 核心：启动Claude Code
│   │       │   └── ui.ts        # 打开Web UI
│   │       └── utils/
│   │
│   ├── server/                 # ✅ P0：后端服务
│   │   └── src/
│   │       ├── index.ts         # 服务入口
│   │       ├── server.ts        # ✅ 核心：Fastify服务器配置
│   │       ├── routes/          # API路由
│   │       │   └── index.ts     # /v1/messages端点
│   │       ├── middleware/      # 中间件
│   │       │   ├── auth.ts      # 身份验证
│   │       │   └── cors.ts      # CORS配置
│   │       └── utils/
│   │           ├── router.ts     # ✅ 核心：智能路由引擎
│   │           ├── SSEParser.transform.ts  # ✅ 核心：响应转换
│   │           └── tokenizer.ts  # Token计算
│   │
│   ├── core/                   # ✅ P0：核心逻辑
│   │   └── src/
│   │       ├── transformer/     # ✅ 核心：API格式转换
│   │       │   ├── base.ts      # Transformer基类
│   │       │   ├── anthropic.ts # Anthropic适配器
│   │       │   ├── openai.ts    # OpenAI适配器
│   │       │   └── gemini.ts    # Gemini适配器
│   │       └── providers/       # 提供商配置
│   │           ├── openrouter.ts
│   │           ├── deepseek.ts
│   │           └── ollama.ts
│   │
│   └── ui/                     # P1：Web管理界面
│       └── src/
│           ├── App.tsx          # React应用入口
│           ├── components/      # UI组件
│           │   ├── ConfigDialog.tsx    # 配置对话框
│           │   ├── LogViewer.tsx        # 日志查看器
│           │   ├── ProviderManager.tsx  # 提供商管理
│           │   └── JsonEditor.tsx       # JSON配置编辑器
│           └── routes.tsx       # 路由配置
│
├── config.json                 # 配置示例
├── pnpm-workspace.yaml         # Monorepo配置
├── package.json                # 根依赖配置
└── tsconfig.json               # TypeScript配置
```

---

### 三层架构图

```
┌─────────────────────────────────────────────┐
│           表现层           │
│ 变化源：用户交互方式（CLI/Web）               │
│ 职责：提供用户界面，启动服务                  │
├─────────────────────────────────────────────┤
│ CLI: packages/cli/                           │
│   - ccr start/stop/code/ui                   │
│ Web UI: packages/ui/                         │
│   - 配置管理/日志查看/模型选择                │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│           应用层              │
│ 变化源：业务流程、路由策略                     │
│ 职责：请求路由、会话管理、配置加载              │
├─────────────────────────────────────────────┤
│ HTTP Server: packages/server/                │
│   - Fastify服务器                             │
│   - API端点: /v1/messages                    │
│   - 中间件: auth/cors                         │
│                                              │
│ Router: src/utils/router.ts                  │
│   - 智能路由决策                               │
│   - 会话缓存                                  │
│   - Token计算                                 │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│           领域层                │
│ 变化源：核心业务规则（API规范、转换逻辑）       │
│ 职责：API格式转换、模型抽象                    │
├─────────────────────────────────────────────┤
│ Transformer: packages/core/src/transformer/  │
│   - Anthropic → OpenAI 格式转换               │
│   - SSE流式响应处理                           │
│   - Tool use适配                              │
│                                              │
│ Providers: packages/core/src/providers/      │
│   - 提供商API封装                             │
│   - OpenRouter/DeepSeek/Gemini/Ollama         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│        基础设施层         │
│ 变化源：外部LLM提供商、HTTP客户端              │
│ 职责：网络通信、提供商集成                      │
├─────────────────────────────────────────────┤
│ HTTP Client: fetch/axios                      │
│   - 发送API请求                               │
│   - SSE流处理                                │
│                                              │
│ External APIs:                               │
│   - OpenAI API                               │
│   - DeepSeek API                             │
│   - Gemini API                               │
│   - Ollama (本地)                            │
└─────────────────────────────────────────────┘
```

---

### 关键设计模式

#### 1. **透明代理模式**

```
Claude Code配置：
  ANTHROPIC_BASE_URL=http://localhost:3456/v1
  ANTHROPIC_API_KEY=ccr-router-key

请求流程：
  Claude Code → localhost:3456 → Router → Provider
              ↑                        ↑
              └────────────────────────┘
              返回标准Anthropic格式响应
```

**核心思想**：Claude Code不知道在使用Router，一切对它透明

---

#### 2. **智能路由策略**

```
路由决策树：

请求特征
  ↓
token > 100K?
  ├─ 是 → longContext模型
  └─ 否 ↓
任务类型？
  ├─ 编辑代码 → background模型
  ├─ 复杂推理 → think模型
  ├─ 网页搜索 → webSearch模型
  └─ 图片 → image模型
  ↓
会话缓存？
  ├─ 命中 → 使用缓存的模型
  └─ 未命中 → 选择新模型
```

---

#### 3. **Transformer模式**

```
API适配器模式：

Transformer（基类）
  ├── transformRequest()  // Anthropic → Provider
  └── transformResponse() // Provider → Anthropic
      ↓
OpenAITransformer    GeminiTransformer    DeepSeekTransformer
```

**隔离变化源**：
- 新增提供商 → 添加新的Transformer
- 修改转换逻辑 → 只影响对应Transformer

---

## 第4步：关键代码识别（定关键）

### 关键代码清单

| 优先级 | 模块/文件 | 职责 | 变化频率 | 必读？ |
|--------|----------|------|---------|--------|
| **P0** | `packages/server/src/utils/router.ts` | 智能路由引擎 | 低（核心逻辑） | ✅ 必读 |
| **P0** | `packages/core/src/transformer/` | API格式转换 | 低（核心抽象） | ✅ 必读 |
| **P0** | `packages/cli/src/commands/code.ts` | 启动Claude Code | 低 | ✅ 必读 |
| **P0** | `packages/server/src/server.ts` | Fastify服务器 | 低 | ✅ 必读 |
| **P1** | `packages/core/src/utils/SSEParser.transform.ts` | SSE流处理 | 中 | ⚠️ 了解 |
| **P1** | `packages/server/src/routes/index.ts` | API路由定义 | 中 | ⚠️ 浏览 |
| **P2** | `packages/ui/src/` | Web UI | 高（频繁演进） | ❌ 按需阅读 |
| **P2** | `packages/server/src/middleware/` | 中间件 | 低 | ❌ 用到再看 |

---

### 最关键的代码路径

```
如果要快速理解Claude Code Router核心逻辑，阅读顺序：

1. packages/cli/src/commands/code.ts
   ↓ 如何启动Claude Code并设置环境变量

2. packages/server/src/server.ts
   ↓ Fastify服务器如何启动和监听

3. packages/server/src/routes/index.ts
   ↓ /v1/messages端点如何接收请求

4. packages/server/src/utils/router.ts
   ↓ ✅ 核心：如何智能选择模型

5. packages/core/src/transformer/base.ts
   ↓ ✅ 核心：Transformer如何转换API格式

6. packages/core/src/utils/SSEParser.transform.ts
   ↓ ✅ 核心：SSE流式响应如何处理
```

**阅读策略**：
- 从P0文件开始，理解"路由+转换"核心机制
- Transformer作为黑盒，先理解接口
- P2模块（Web UI）可以完全跳过

---

## 🎯 架构设计分析（变化源隔离）

### Claude Code Router如何隔离变化源？

| 变化源 | 隔离手段 | 证据 |
|--------|---------|------|
| **LLM提供商API** | `packages/core/src/transformer/`模块 | 每个提供商独立Transformer |
| **路由策略** | `packages/server/src/utils/router.ts`封装 | 配置驱动，可插拔路由规则 |
| **Claude Code协议** | 实现Anthropic API规范 | 标准接口，内部自由变化 |
| **用户界面** | CLI + Web UI双前端 | UI变化不影响核心路由逻辑 |
| **配置格式** | JSON配置文件 | 版本化配置，向后兼容 |

---

### 架构亮点

**1. 透明代理设计**
```
✅ Claude Code无需修改
✅ 通过环境变量集成
✅ 用户无感知切换模型
```

**2. 智能路由**
```
✅ 任务类型感知
✅ 上下文长度感知
✅ 会话缓存优化
✅ 自动阈值切换
```

**3. 提供商解耦**
```
✅ 统一Transformer接口
✅ 支持OpenRouter/DeepSeek/Gemini/Ollama
✅ 易于添加新提供商
```

**4. Monorepo架构**
```
✅ packages/cli（独立发布）
✅ packages/server（独立发布）
✅ packages/core（共享库）
✅ packages/ui（独立前端）
```

---

## 学习路径建议

### 如果你想快速上手使用

```
Day 1: 安装配置（1小时）
├─ npm install -g @musistudio/claude-code-router
├─ 配置~/.claude-code-router/config.json
├─ ccr start
└─ ccr code（启动Claude Code）

Day 2: 高级配置（2小时）
├─ 配置多个提供商
├─ 设置路由规则
├─ 使用Web UI管理
└─ 理解路由决策

Day 3: 深入理解（3小时）
├─ 阅读核心源码
├─ 理解Transformer机制
└─ 尝试添加新提供商
```

---

### 如果你想理解源码

```
阶段1：黑盒理解（1天）
├─ 使用所有命令（ccr start/code/ui）
├─ 观察日志输出
├─ 理解配置格式
└─ 建立认知模型

阶段2：白盒拆解（3天）
├─ 阅读核心命令
├─ 理解模块职责
└─ 画数据流图

阶段3：破坏测试（1天）
├─ 配置错误会怎样？
├─ 提供商宕机会怎样？
├─ 并发请求会怎样？
└─ 边界条件测试

阶段4：扩展实践（可选）
├─ 添加新的提供商
├─ 自定义路由规则
└─ 贡献PR
```

---

## 总结：这个项目的设计智慧

### 1. **透明代理思想**
```
解决Claude Code锁定问题：
  不修改Claude Code → 通过环境变量重定向
  用户无感知 → 保持完整体验
```

### 2. **智能路由降低成本**
```
不同任务用不同模型：
  简单任务 → 本地模型（免费）
  复杂推理 → DeepSeek（便宜）
  长上下文 → OpenRouter（灵活）
→ 成本优化 10-100倍
```

### 3. **适配器模式解耦**
```
API规范差异：
  Anthropic API ←→ Transformer ←→ OpenAI API
  Gemini API ←→ Transformer ←→ DeepSeek API
→ 添加新提供商只需实现Transformer接口
```

### 4. **Monorepo模块化**
```
独立演进：
  CLI可以独立升级
  Server可以独立部署
  UI可以独立重构
→ 降低维护成本
```

---

## 💡 核心洞察

**这个项目的本质是什么？**

不是简单的CLI工具，而是一个**完整的API Gateway + 请求转换器**，核心价值在于：

1. **打破锁定**：Claude Code不再锁定Anthropic
2. **成本优化**：智能路由到最便宜的模型
3. **技术解耦**：通过适配器模式隔离API差异
4. **用户体验**：透明的代理，用户无感知

**适用场景**：
- 成本敏感的个人开发者
- 需要本地部署的企业
- 地理限制地区
- 需要多模型组合的复杂任务

---

**Sources:**
- [claude-code-router GitHub Repository](https://github.com/musistudio/claude-code-router)
- [README_zh.md](https://github.com/musistudio/claude-code-router/blob/main/README_zh.md)
- [核心架构概述 | Zread](https://zread.ai/musistudio/claude-code-router/9-core-architecture-overview)
- [项目动机博客](https://github.com/musistudio/claude-code-router/blob/main/blog/en/project-motivation-and-how-it-works.md)
- [Claude Code Router 官方文档](https://musistudio.github.io/claude-code-router/)

---

**生成时间**: 2026-01-05
**Skill版本**: rapid-project-understanding v1.0
