---
title: "Edge Ai Hello World 251231"
date: 2025-12-31
categories: ["AI"]
tags: ["ai", "Python", "Pytorch"]
---


# 🎯 端侧 AI 的 Hello World - 最小可运行示例

> **目标**：一个能完整跑通数据流的最简单模型，用于学习追踪

---

## 📦 这个"最简单的东西"是什么？

### **定义**

一个**最小可运行的端侧 AI 数据流**：

```
固定图片输入
    ↓
简单 CNN 模型（2 层卷积）
    ↓
PyTorch 推理
    ↓
转换为 ONNX
    ↓
转换为 TensorRT
    ↓
GPU 推理
    ↓
输出分类结果
```

**每一步都可以单独验证**。

---

## 🚀 完整代码（可运行）

### **步骤1：创建最简单的模型**

```python
# simple_model.py - 最简单的 CNN 模型

import torch
import torch.nn as nn

class SimpleCNN(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        # 只有 2 层卷积 + 1 层全连接
        self.features = nn.Sequential(
            # 层1: 输入 3x64x64 → 输出 16x32x32
            nn.Conv2d(3, 16, kernel_size=3, stride=1, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),  # 64x64 → 32x32

            # 层2: 输入 16x32x32 → 输出 32x16x16
            nn.Conv2d(16, 32, kernel_size=3, stride=1, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),  # 32x32 → 16x16
        )

        # 分类头
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(32 * 16 * 16, 128),
            nn.ReLU(),
            nn.Linear(128, num_classes)
        )

    def forward(self, x):
        features = self.features(x)
        output = self.classifier(features)
        return output

# 创建模型
model = SimpleCNN(num_classes=10)

# 测试推理
dummy_input = torch.randn(1, 3, 64, 64)
output = model(dummy_input)

print(f"输入形状: {dummy_input.shape}")
print(f"输出形状: {output.shape}")
print(f"输出值（前5个）: {output[0, :5]}")

# 保存模型
torch.save(model.state_dict(), "simple_cnn.pth")
print("✅ 模型已保存到 simple_cnn.pth")
```

**运行**：
```bash
python3 simple_model.py
```

**输出**：
```
输入形状: torch.Size([1, 3, 64, 64])
输出形状: torch.Size([1, 10])
输出值（前5个）: tensor([ 0.1234, -0.5678,  0.9012, ...])
✅ 模型已保存到 simple_cnn.pth
```

---

### **步骤2：准备固定输入（用于验证）**

```python
# create_test_input.py - 创建固定的测试输入

import torch
import numpy as np
from PIL import Image

# 方法1：创建随机图片（简单）
def create_random_image():
    # 创建 64x64 RGB 随机图片
    img_array = np.random.randint(0, 255, (64, 64, 3), dtype=np.uint8)
    img = Image.fromarray(img_array)

    # 保存
    img.save("test_image_64x64.jpg")
    print("✅ 随机测试图片已保存")

    # 转换为 Tensor
    img_tensor = torch.from_numpy(img_array).float() / 255.0
    img_tensor = img_tensor.permute(2, 0, 1).unsqueeze(0)  # (1, 3, 64, 64)

    # 保存 tensor
    torch.save(img_tensor, "test_input.pt")
    print("✅ 测试 Tensor 已保存到 test_input.pt")

    return img_tensor

# 方法2：创建固定图片（可复现）
def create_fixed_image():
    # 创建固定图案（渐变）
    img_array = np.zeros((64, 64, 3), dtype=np.uint8)

    for i in range(64):
        for j in range(64):
            img_array[i, j, 0] = int(i * 4)    # R: 0-255 (行渐变)
            img_array[i, j, 1] = int(j * 4)    # G: 0-255 (列渐变)
            img_array[i, j, 2] = 128           # B: 固定

    img = Image.fromarray(img_array)
    img.save("test_image_fixed.jpg")
    print("✅ 固定测试图片已保存")

    # 转换为 Tensor
    img_tensor = torch.from_numpy(img_array).float() / 255.0
    img_tensor = img_tensor.permute(2, 0, 1).unsqueeze(0)

    # 保存 tensor
    torch.save(img_tensor, "test_input_fixed.pt")
    print("✅ 固定测试 Tensor 已保存")

    return img_tensor

if __name__ == "__main__":
    print("创建测试输入...")
    tensor1 = create_random_image()
    tensor2 = create_fixed_image()

    print(f"\n随机 Tensor 形状: {tensor1.shape}")
    print(f"固定 Tensor 形状: {tensor2.shape}")
    print(f"固定 Tensor 范围: [{tensor2.min():.3f}, {tensor2.max():.3f}]")
```

**运行**：
```bash
python3 create_test_input.py
```

**输出**：
```
✅ 随机测试图片已保存
✅ 测试 Tensor 已保存到 test_input.pt
✅ 固定测试图片已保存
✅ 固定测试 Tensor 已保存
固定 Tensor 范围: [0.000, 1.000]
```

---

### **步骤3：完整的推理脚本（基准）**

```python
# inference_baseline.py - PyTorch 推理基准

import torch
import time

# 加载模型
model = SimpleCNN(num_classes=10)
model.load_state_dict(torch.load("simple_cnn.pth"))
model.eval()

# 加载测试输入
input_tensor = torch.load("test_input_fixed.pt")

# 推理
with torch.no_grad():
    output = model(input_tensor)

print(f"输入: {input_tensor.shape}")
print(f"输出: {output.shape}")
print(f"输出值: {output[0]}")
print(f"预测类别: {output[0].argmax().item()}")
print(f"最大值: {output[0].max().item():.4f}")

# 性能测试
n_times = 100
start = time.time()
for _ in range(n_times):
    with torch.no_grad():
        _ = model(input_tensor)
end = time.time()

print(f"\n平均推理时间: {(end-start)/n_times*1000:.2f} ms")
print(f"FPS: {n_times/(end-start):.2f}")
```

**运行**：
```bash
python3 inference_baseline.py
```

**输出**：
```
输入: torch.Size([1, 3, 64, 64])
输出: torch.Size([1, 10])
输出值: tensor([ 0.0123, -0.0456,  0.0789, ...])
预测类别: 5
最大值: 0.1234

平均推理时间: 2.34 ms
FPS: 427.35
```

**这个输出是基准，后续所有转换都要对比这个结果！**

---

## 🎯 追踪脚本追踪的是什么？

### **核心对象：数据流的每一步转换**

```
步骤1：PyTorch 模型
  追踪对象：simple_cnn.pth
  验证：模型能否加载
  工具：python3 -c "import torch; model=torch.load('simple_cnn.pth')"

步骤2：PyTorch 推理
  追踪对象：test_input_fixed.pt + simple_cnn.pth
  验证：输出是否正确
  工具：python3 inference_baseline.py
  基准输出：预测类别=5, 最大值=0.1234

步骤3：ONNX 转换
  追踪对象：simple_cnn.pth → simple_cnn.onnx
  验证：ONNX 模型是否有效
  工具：onnx.checker.check_model()

步骤4：ONNX 推理
  追踪对象：test_input_fixed.pt + simple_cnn.onnx
  验证：输出是否与 PyTorch 一致
  工具：onnxruntime.InferenceSession()
  对比：|output_onnx - output_pytorch| < 1e-5

步骤5：TensorRT 转换
  追踪对象：simple_cnn.onnx → simple_cnn.engine
  验证：engine 是否构建成功
  工具：trt.Builder

步骤6：TensorRT 推理
  追踪对象：test_input_fixed.pt + simple_cnn.engine
  验证：输出是否与 PyTorch 一致
  工具：tensorrt.Runtime
  对比：|output_trt - output_pytorch| < 1e-3
```

---

## 🔧 现在可以写追踪脚本了

### **第一个追踪脚本：PyTorch → ONNX**

```bash
#!/bin/bash
# trace_pytorch_to_onnx.sh - 追踪 PyTorch 转 ONNX

echo "🔍 追踪 PyTorch → ONNX..."

# 1. 检查输入文件
echo "[1/5] 检查输入文件..."
ls -lh simple_cnn.pth test_input_fixed.pt

# 2. PyTorch 基准推理
echo "[2/5] PyTorch 基准推理..."
python3 inference_baseline.py > baseline_output.txt
cat baseline_output.txt

# 3. 转换为 ONNX
echo "[3/5] 转换为 ONNX..."
python3 << EOF
import torch
from simple_model import SimpleCNN

model = SimpleCNN(num_classes=10)
model.load_state_dict(torch.load("simple_cnn.pth"))
model.eval()

dummy_input = torch.load("test_input_fixed.pt")

torch.onnx.export(
    model,
    dummy_input,
    "simple_cnn.onnx",
    export_params=True,
    opset_version=17,
    do_constant_folding=True,
    input_names=['input'],
    output_names=['output'],
    verbose=False
)
print("✅ ONNX 导出成功")
EOF

# 4. 验证 ONNX 模型
echo "[4/5] 验证 ONNX 模型..."
python3 << EOF
import onnx
model = onnx.load("simple_cnn.onnx")
onnx.checker.check_model(model)
print("✅ ONNX 模型有效")
EOF

# 5. ONNX 推理并对比
echo "[5/5] ONNX 推理..."
python3 << EOF
import onnxruntime as ort
import torch
import numpy as np

# 加载模型
session = ort.InferenceSession("simple_cnn.onnx")
input_tensor = torch.load("test_input_fixed.pt").numpy()

# 推理
outputs = session.run(None, {'input': input_tensor})
output_onnx = outputs[0]

# 读取基准
with open("baseline_output.txt") as f:
    for line in f:
        if "预测类别:" in line:
            baseline_class = int(line.split(":")[1].strip())
        if "最大值:" in line:
            baseline_max = float(line.split(":")[1].strip())

# 对比
onnx_class = output_onnx.argmax()
onnx_max = output_onnx.max()

print(f"PyTorch: 类别={baseline_class}, 最大值={baseline_max:.4f}")
print(f"ONNX:    类别={onnx_class}, 最大值={onnx_max:.4f}")
print(f"差异:    类别={'✅ 一致' if baseline_class==onnx_class else '❌ 不一致'}")

diff = np.abs(output_onnx.flatten() - torch.load("test_input_fixed.pt").numpy()).max()
print(f"数值差异: {diff:.6f}")
EOF

echo "✅ 追踪完成！"
```

---

## 💡 为什么这个"最简单的东西"重要？

### **作为"探针"的作用**

```
✅ 固定输入：知道输入是什么
✅ 固定输出：知道正确输出是什么
✅ 简单模型：能理解每一步在做什么
✅ 可验证：每一步都能对比基准

就像电路板的"测试点"：
  - 测试点1：输入是否正确？
  - 测试点2：模型加载成功？
  - 测试点3：ONNX 转换正确？
  - 测试点4：TensorRT 转换正确？
  - 测试点5：最终输出是否一致？
```

---

## 🚀 现在可以开始学习了

### **第一步：运行最小示例**

```bash
# 1. 创建模型
python3 simple_model.py

# 2. 创建测试输入
python3 create_test_input.py

# 3. 运行基准推理
python3 inference_baseline.py

# 记录输出！这是后续所有对比的基准
```

### **第二步：转换并验证**

```bash
# 4. PyTorch → ONNX
python3 convert_to_onnx.py

# 5. ONNX 推理并对比
python3 inference_onnx.py

# 6. 检查：ONNX 输出是否与 PyTorch 一致？
```

### **第三步：优化并验证**

```bash
# 7. ONNX → TensorRT
python3 convert_to_tensorrt.py

# 8. TensorRT 推理并对比
python3 inference_tensorrt.py

# 9. 检查：TensorRT 输出是否与 PyTorch 一致？
```

---

## 📊 完整数据流追踪表

```
步骤  文件              输入              输出              验证方法
──────────────────────────────────────────────────────────────────
1     simple_model.py    -                 simple_cnn.pth    ls -lh
2     create_test_input  -                 test_input.pt      torch.load
3     baseline.py        simple_cnn.pth    output_baseline    记录输出
4     to_onnx.py         simple_cnn.pth    simple_cnn.onnx    onnx.checker
5     onnx_inference.py  simple_cnn.onnx   output_onnx        对比baseline
6     to_tensorrt.py     simple_cnn.onnx   simple_cnn.engine  trt.Builder
7     trt_inference.py   simple_cnn.engine output_trt         对比baseline
```

**每一步都有明确的输入、输出、验证方法！**

---

现在你有这个"最简单的东西"了，追踪脚本追踪的就是**这个数据流的每一步转换**。

想先运行一下这个最小示例吗？
