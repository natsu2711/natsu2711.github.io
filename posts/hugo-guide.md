---
title: '使用 Hugo 快速搭建静态网站'
date: '2024-04-15'
category: '编程相关'
tags: ['Hugo', 'Web', 'Development']
---

Hugo 是一个用 Go 语言编写的静态网站生成器。它以其惊人的速度和灵活性而闻名。

### 安装 Hugo

你可以根据你的操作系统，从 Hugo 的官方文档中找到安装说明。在 macOS 上，你可以使用 Homebrew：

```bash
brew install hugo
```

### 创建新站点

创建一个新的 Hugo 站点非常简单。

```bash
hugo new site quickstart
cd quickstart
```

### 添加主题

Hugo 有大量的主题可供选择。你可以将一个主题添加为 Git 子模块。

```bash
git init
git submodule add https://github.com/theNewDynamic/gohugo-theme-ananke.git themes/ananke
echo "theme = 'ananke'" >> hugo.toml
```

### 添加内容

```bash
hugo new content posts/my-first-post.md
```

现在你可以编辑 `content/posts/my-first-post.md` 并添加你的内容了。

### 启动服务器

```bash
hugo server -D
```

现在，你可以在 `http://localhost:1313/` 查看你的站点。
