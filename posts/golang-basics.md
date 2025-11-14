---
title: 'Go语言入门基础'
date: '2024-05-20'
category: '编程相关'
tags: ['Golang', 'Development', '编程']
---

Go语言（或 Golang）是Google开发的一种静态强类型、编译型、并发型，并具有垃圾回收功能的编程语言。

### 变量和常量

在Go中，你可以使用 `var` 关键字声明变量。

```go
package main

import "fmt"

func main() {
    var a = "initial"
    fmt.Println(a)

    var b, c int = 1, 2
    fmt.Println(b, c)

    var d = true
    fmt.Println(d)

    var e int
    fmt.Println(e)

    f := "apple"
    fmt.Println(f)
}
```

### 控制结构

Go支持常见的控制结构，如 `if/else` 和 `for` 循环。

```go
package main

import "fmt"

func main() {

    i := 1
    for i <= 3 {
        fmt.Println(i)
        i = i + 1
    }

    for j := 7; j <= 9; j++ {
        fmt.Println(j)
    }

    for {
        fmt.Println("loop")
        break
    }
}
```
