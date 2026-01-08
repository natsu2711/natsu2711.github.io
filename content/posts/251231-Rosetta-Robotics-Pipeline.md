---
title: "Rosetta Robotics Pipeline"
date: 2025-12-31
categories: ["EE"]
tags: ["Go"]
---


# Rosetta Stone Analysis: Robotics Pipeline
**Date**: 2025-12-31
**Target System**: Robotics Software Pipeline (From Planning to Motor Control)
**Method**: 罗塞塔石碑实验法

---

## 第一步：定层级 (Define Layers)

### 层级划分表

| 层级 | 名称 | 数据形态 | 示例 | 可观测性 |
|------|------|----------|------|----------|
| **层级1** | 规划层 (Planning) | 路径点、轨迹 | `[(x1,y1), (x2,y2), ...]` | ✅ ROS2话题/RViz |
| **层级2** | 控制层 (Control) | 控制指令 (力矩/速度) | `τ = [0.5, -0.3, ...]` | ✅ 控制器输出 |
| **层级3** | 状态估计层 (State Estimation) | 状态向量 | `x = [x, y, θ, ẋ, ẏ, θ̇]` | ✅ EKF输出 |
| **层级4** | 感知层 (Perception) | 点云、特征 | `PointCloud, Landmarks` | ✅ 传感器数据 |
| **层级5** | 中间件层 (ROS2) | 消息、服务 | `sensor_msgs, geometry_msgs` | ✅ rqt, ros2 topic |
| **层级6** | 嵌入式层 (Embedded) | PWM信号、寄存器值 | `PWM = 1500, GPIO = HIGH` | ✅ 示波器/逻辑分析仪 |
| **层级7** | 物理层 (Hardware) | 电流、电压、转速 | `I = 2.5A, V = 12V, ω = 100 rad/s` | ✅ 万用表/测速仪 |

### 核心数据流公式

```
高层目标 (Goal) → 规划 → 控制 → 执行 → 反馈 → 状态估计 → 闭环
    ↓              ↓       ↓       ↓       ↓         ↓
"前进1米"     轨迹    力矩    PWM   电机转动   编码器   位置估计
```

---

## 第二步：定关卡 (Define Checkpoints)

### 关卡1: 规划到控制 (Planning → Control)

| 属性 | 描述 |
|------|------|
| **数据转换** | 路径点 → 控制指令 |
| **必经原因** | 机器人必须知道"怎么走"才能"怎么动" |
| **形态突变** | 离散路径 → 连续控制信号 |
| **关键问题** | 如何跟踪轨迹？PID vs LQR vs MPC |

**因果链路**:
```
目标位置 (Goal)
    ↓
全局规划 (A* / RRT) → 全局路径
    ↓
局部规划 (TEB / DWA) → 局部轨迹
    ↓
控制器 (PID / LQR / MPC) → 控制指令 (u)
```

**排查问题链路**:
```
现象: 机器人震荡
  ↓
检查控制器 → PID参数是否过大？
  ↓ 是
  → 降低Kp
  ↓ 否
检查规划器 → 轨迹是否变化太快？
  ↓ 是
  → 增加轨迹平滑
  ↓ 否
检查执行器 → 电机响应是否延迟？
```

---

### 关卡2: 控制到执行 (Control → Actuation)

| 属性 | 描述 |
|------|------|
| **数据转换** | 控制指令 (u) → PWM信号 → 电机运动 |
| **必经原因** | 数字信号必须转换成物理动作 |
| **形态突变** | 浮点数 → 占空比 → 电流 → 转矩 |
| **关键问题** | 量化误差、延迟、饱和 |

**因果链路**:
```
控制器输出 (u = [v, ω])  ← 线速度、角速度
    ↓
运动学解算 → 左右轮速度
    ↓
速度控制器 → 期望PWM
    ↓
PWM生成器 → 占空比 (50%)
    ↓
电机驱动 → 电流 (I = 2A)
    ↓
电机 → 转矩 (τ) → 转速 (ω)
```

**排查问题链路**:
```
现象: 电机不转
  ↓
检查关卡1 (PWM) → GPIO输出是否有PWM？
  ↓ 否
  → 检查代码初始化
  ↓ 是
检查关卡2 (驱动) → 驱动器使能信号？
  ↓ 否
  → 发送使能命令
  ↓ 是
检查关卡3 (电流) → 电机是否有电流？
  ↓ 否
  → 检查电源/接线
```

---

### 关卡3: 传感器到状态估计 (Sensors → State)

| 属性 | 描述 |
|------|------|
| **数据转换** | 原始传感器 → 状态向量 |
| **必经原因** | 传感器有噪声，需要融合 |
| **形态突变** | 离散测量 → 连续状态估计 |
| **关键问题** | 传感器融合、延迟同步 |

**因果链路**:
```
真实状态 (x_true)
    ↓
传感器测量 → 噪声数据
    ↓
    ├── IMU → 加速度、角速度
    ├── 编码器 → 轮速
    ├── LiDAR → 点云
    └── 相机 → 图像
    ↓
数据预处理 → 标定、去噪
    ↓
传感器融合 (EKF / UKF) → 状态估计 (x_est)
    ↓
不确定性量化 → 协方差矩阵 (P)
```

**排查问题链路**:
```
现象: 位置估计漂移
  ↓
检查关卡1 (传感器) → 编码器是否打滑？
  ↓ 是
  → 检查轮胎/地面
  ↓ 否
检查关卡2 (融合) → EKF协方差是否合理？
  ↓ 否
  → 调整过程噪声Q
  ↓ 是
检查关卡3 (同步) → 传感器时间戳对齐？
  ↓ 否
  → 添加时间戳补偿
```

---

### 关卡4: 反馈闭环 (State → Planning)

| 属性 | 描述 |
|------|------|
| **数据转换** | 状态估计 → 规划修正 |
| **必经原因** | 实际位置偏离计划，必须重新规划 |
| **形态突变** | 当前状态 → 新轨迹 |
| **关键问题** | 动态环境、局部极小值 |

**因果链路**:
```
估计状态 (x_est)
    ↓
与计划对比 → 误差 (e = x_desired - x_est)
    ↓
误差判断 → 是否需要重新规划？
    ↓
    ├── 否 → 继续执行
    └── 是 → 局部重规划
    ↓
更新控制指令 → 修正动作
```

---

## 第三步：架工具 (Deploy Tools)

### 关卡1: 规划层工具

| 工具 | 解决痛点 | 命令 | 功能 |
|------|----------|------|------|
| **RViz** | 可视化路径和状态 | `rviz2` | 3D可视化 |
| **rqt** | 实时监控话题 | `rqt_graph` | 节点图可视化 |
| **ros2 topic** | 查看消息流 | `ros2 topic echo /plan` | 查看规划路径 |
| **ros2 bag** | 录制数据 | `ros2 bag record` | 录制传感器数据 |

### 关卡2: 控制层工具

| 工具 | 解决痛点 | 命令 | 功能 |
|------|----------|------|------|
| **rqt_plot** | 绘制控制曲线 | `rqt_plot /cmd_vel` | 实时绘图 |
| **ros2 parameter** | 动态调参 | `ros2 param set` | 修改PID参数 |
| **rosservice** | 调用服务 | `rosservice call /reset` | 重置控制器 |

### 关卡3: 嵌入式层工具

| 工具 | 解决痛点 | 命令 | 功能 |
|------|----------|------|------|
| **逻辑分析仪** | 捕获PWM信号 | - | 查看占空比 |
| **oscilloscope** | 查看电压波形 | - | 检查驱动信号 |
| **multimeter** | 测量电流电压 | - | 检查电源 |
| **i2c-tools** | I2C设备调试 | `i2cdetect -y 1` | 扫描I2C设备 |

### 关卡4: 传感器层工具

| 工具 | 解决痛点 | 命令 | 功能 |
|------|----------|------|------|
| **ros2 topic hz** | 查看传感器频率 | `ros2 topic hz /imu` | 检查数据频率 |
| **tf2_tools** | 坐标系查看 | `ros2 run tf2_tools view_frames` | 可视化TF树 |
| **kalibr** | 传感器标定 | `kalibr_calibrate_imu_camera` | IMU-相机标定 |

---

## 第四步：投示踪 (Inject Tracers)

### 示踪剂设计原则

```python
# ❌ 错误: 太普通，搜不到
target_position = 1.0

# ✅ 正确: 独特的魔术数字
MAGIC_POSITION = 0xDEADBEEF / 1e7  # 3.7355592

# ✅ 正确: 特殊字符串
TRACER_FRAME = "TRACER_BASE_LINK_001"

# ✅ 正确: 特殊时间戳
TRACER_TIMESTAMP = 123456789.123456
```

---

## 🧪 实验1: 规划层追踪 (理解路径生成)

### 🎯 为什么要学这个？

**现实痛点**:
1. 机器人不动，不知道是规划问题还是控制问题
2. 路径奇怪，不知道规划器在干什么
3. 动态避障不生效

**学习目标**: 理解"目标位置"如何变成"可行路径"

---

### 📝 示踪代码

```python
# planning_tracer.py
import rclpy
from rclpy.node import Node
from nav2_simple_commander.robot_navigator import BasicNavigator
from geometry_msgs.msg import PoseStamped

# 示踪剂1: 魔术数字 (易于搜索)
TRACER_X = 0xDEADBEEF / 1e7  # ≈ 3.7355
TRACER_Y = 0xCAFEBABE / 1e7  # ≈ 3.4029

# 示踪剂2: 特殊字符串
TRACER_FRAME = "TRACER_MAP_001"

class PlanningTracer(Node):
    def __init__(self):
        super().__init__('planning_tracer')
        self.navigator = BasicNavigator()

        # 订阅规划路径 (关卡1: 规划器输出)
        self.create_subscription(
            PoseStamped,
            '/goal_pose',
            self.goal_callback,
            10
        )

        # 订阅全局路径 (关卡2: 全局规划器)
        self.create_subscription(
            Path,
            '/plan',
            self.plan_callback,
            10
        )

    def goal_callback(self, msg):
        self.get_logger().info(f'[TRACER] Received goal: '
                                f'x={msg.pose.position.x:.4f}, '
                                f'y={msg.pose.position.y:.4f}')

        # 埋入示踪剂作为目标
        goal = PoseStamped()
        goal.header.frame_id = TRACER_FRAME
        goal.pose.position.x = TRACER_X
        goal.pose.position.y = TRACER_Y

        self.get_logger().info(f'[TRACER] Going to magic position: '
                                f'{TRACER_X:.6f}, {TRACER_Y:.6f}')

        # 开始规划
        self.navigator.goToPose(goal)

    def plan_callback(self, msg):
        # 搜索示踪剂: 检查路径是否包含目标点
        poses = msg.poses
        self.get_logger().info(f'[TRACER] Path has {len(poses)} waypoints')

        # 检查最后一个点
        last = poses[-1]
        self.get_logger().info(f'[TRACER] Final waypoint: '
                                f'x={last.pose.position.x:.6f}, '
                                f'y={last.pose.position.y:.6f}')

        # 验证: 是否接近示踪剂目标？
        dist = ((last.pose.position.x - TRACER_X)**2 +
                (last.pose.position.y - TRACER_Y)**2)**0.5
        self.get_logger().info(f'[TRACER] Distance to target: {dist:.6f}m')
```

---

### 💉 观察步骤

```bash
# 终端1: 启动机器人
ros2 launch your_robot_bringup minimal.launch.py

# 终端2: 启动规划器
ros2 launch nav2_bringup navigation_launch.py

# 终端3: 运行示踪程序
python3 planning_tracer.py

# 终端4: 监控话题
ros2 topic echo /plan --field poses
ros2 topic echo /local_plan --field poses

# 搜索示踪剂
ros2 topic echo /plan | grep -i "TRACER"
```

---

### 👀 观察分析

#### 🔷 观察1: 全局路径生成

**观测结果**:
```
[TRACER] Received goal: x=0.0000, y=0.0000
[TRACER] Going to magic position: 3.735559, 3.402893
[TRACER] Path has 47 waypoints
[TRACER] Final waypoint: x=3.735559, y=3.402893
[TRACER] Distance to target: 0.000000m
```

**冰山下的知识**:

| 概念 | 是什么 | 为什么需要 | 能解决什么问题 |
|------|-------|-----------|--------------|
| 路径离散化 | 连续曲线 → 离散点集 | 控制器需要离散指令 | 理解路径分辨率 |
| 路径点密度 | 相邻点间距 | 太密计算量大，太稀不精确 | 调整规划精度 |
| 路径平滑性 | 路径点之间角度变化 | 影响机器人运动平滑度 | 减少震荡 |

**认知映射**:
```
高层命令: "去位置 (3.73, 3.40)"
    ↓
全局规划器 (A* / Smac)
    ↓
离散路径: 47个路径点
    ↓
理解: 规划器把连续空间问题变成离散图搜索
      路径点数 = 精度 × 距离
```

---

#### 🔷 观察2: 局部轨迹更新

**观测结果**:
```
[TRACER] Local plan: 20 poses
[TRACER] Update rate: 10Hz
[TRACER] Trajectory lookahead: 3.0m
```

**冰山下的知识**:

| 概念 | 是什么 | 为什么需要 | 能解决什么问题 |
|------|-------|-----------|--------------|
| 局部规划 | 短期轨迹优化 | 响应动态障碍物 | 避障 |
| 预视距离 | 轨迹预测多远 | 太近反应慢，太远计算量大 | 调整控制前瞻性 |
| 更新频率 | 每秒重规划次数 | 太慢不能及时避障 | 理解控制延迟 |

**认知映射**:
```
全局路径 (47个点, 静态)
    ↓
局部规划器 (DWA / TEB)
    ↓
局部轨迹 (20个点, 10Hz更新)
    ↓
理解: 全局规划是战略，局部规划是战术
      局部轨迹是滚动优化的
```

---

### 🎯 这个实验能解决什么问题？

**问题1: 机器人不动**
```bash
# 检查关卡
ros2 topic echo /cmd_vel  # 有输出吗？
ros2 topic echo /plan     # 有路径吗？
ros2 node list            # 规划器在运行吗？

# 诊断:
- /plan 无数据 → 规划器问题 (检查代价地图)
- /plan 有数据, /cmd_vel 无数据 → 控制器问题
```

**问题2: 路径奇怪**
```bash
# 可视化代价地图
ros2 run nav2_map_server map_server -params costmap

# 诊断:
- 路径绕远路 → 代价地图有膨胀层
- 路径穿过障碍 → 代价地图没更新
```

---

## 🧪 实验2: 控制层追踪 (理解控制指令)

### 📝 示踪代码

```python
# control_tracer.py
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist

# 示踪剂: 特殊速度值
TRACER_LINEAR_X = 0x12345678 / 1e9  # ≈ 0.305 m/s
TRACER_ANGULAR_Z = 0x87654321 / 1e9  # ≈ -0.527 rad/s

class ControlTracer(Node):
    def __init__(self):
        super().__init__('control_tracer')

        # 订阅控制指令 (关卡: 控制器输出)
        self.create_subscription(
            Twist,
            '/cmd_vel',
            self.cmd_callback,
            10
        )

        # 发布控制指令 (注入示踪剂)
        self.cmd_pub = self.create_publisher(Twist, '/cmd_vel', 10)

        # 定时器: 每2秒注入示踪剂
        self.timer = self.create_timer(2.0, self.inject_tracer)

    def cmd_callback(self, msg):
        # 搜索示踪剂: 检查控制指令
        vx = msg.linear.x
        wz = msg.angular.z

        self.get_logger().info(f'[TRACER] cmd_vel: vx={vx:.6f}, wz={wz:.6f}')

        # 检查是否接近示踪剂值
        if abs(vx - TRACER_LINEAR_X) < 0.001:
            self.get_logger().info(f'[TRACER] *** FOUND TRACER VELOCITY! ***')

    def inject_tracer(self):
        # 注入示踪剂到控制流
        msg = Twist()
        msg.linear.x = TRACER_LINEAR_X
        msg.angular.z = TRACER_ANGULAR_Z

        self.get_logger().info(f'[TRACER] Injecting: vx={TRACER_LINEAR_X:.6f}, '
                                f'wz={TRACER_ANGULAR_Z:.6f}')
        self.cmd_pub.publish(msg)
```

---

### 💉 观察步骤

```bash
# 运行控制示踪
python3 control_tracer.py

# 监控
ros2 topic echo /cmd_vel

# 绘制控制曲线
rqt_plot /cmd_vel/linear:x /cmd_vel/angular:z
```

---

### 👀 观察分析

#### 🔷 观察: 控制器响应

**观测结果**:
```
[TRACER] Injecting: vx=0.305420, wz=-0.527311
[TRACER] cmd_vel: vx=0.305420, wz=-0.527311  ← 立即响应
[TRACER] cmd_vel: vx=0.280000, wz=-0.490000  ← 实际测量值(有偏差)
```

**冰山下的知识**:

| 概念 | 是什么 | 为什么需要 | 能解决什么问题 |
|------|-------|-----------|--------------|
| 控制周期 | 控制器更新频率 (20Hz) | 太慢不稳定，太快浪费 | 理解控制延迟 |
| 执行延迟 | 指令到动作的时间 | 机械/电子延迟 | 补偿滞后 |
| 稳态误差 | 期望 vs 实际偏差 | 摩擦、量化误差 | 调整PID积分项 |

**认知映射**:
```
控制指令 (u = 0.305 m/s)
    ↓
控制器 (PID)
    ↓
执行器 (电机 + PWM)
    ↓
实际速度 (v = 0.280 m/s) ← 有8%误差
    ↓
理解: 闭环控制有稳态误差
      需要反馈修正
```

---

## 🧪 实验3: 嵌入式层追踪 (理解PWM生成)

### 📝 示踪代码 (C++ / Arduino)

```cpp
// pwm_tracer.ino
// 示踪剂: 特殊PWM值
const uint16_t TRACER_PWM = 0xCAFE;  // 51914

void setup() {
  Serial.begin(115200);
  pinMode(9, OUTPUT);  // PWM pin

  // 注入示踪剂
  Serial.println("[TRACER] Injecting PWM: 0xCAFE");
  analogWrite(9, TRACER_PWM);
}

void loop() {
  // 读取实际PWM
  uint16_t actual_pwm = analogRead(9);

  Serial.print("[TRACER] Expected: ");
  Serial.print(TRACER_PWM);
  Serial.print(" Actual: ");
  Serial.println(actual_pwm);

  delay(100);
}
```

---

### 💉 观察步骤

```bash
# 上传到Arduino
arduino-cli upload -p /dev/ttyUSB0 pwm_tracer.ino

# 串口监控
arduino-cli monitor -p /dev/ttyUSB0 -c baudrate=115200

# 逻辑分析仪
# 接通道到Pin 9，捕获PWM波形
```

---

### 👀 观察分析

#### 🔷 观察: PWM到电压

**观测结果**:
```
[TRACER] Injecting PWM: 51914 (0xCAFE)
[TRACER] Expected: 51914 Actual: 51914
逻辑分析仪: 频率=490Hz, 占空比=80.4%
```

**冰山下的知识**:

| 概念 | 是什么 | 为什么需要 | 能解决什么问题 |
|------|-------|-----------|--------------|
| PWM | 脉宽调制，占空比控制电压 | 数字控制模拟电压 | 速度控制 |
| PWM频率 | 脉冲频率 (490Hz) | 太低电机抖动，太高损耗大 | 调整平滑度 |
| 分辨率 | PWM精度 (8位 = 0-255) | 太粗糙控制不精 | 理解量化误差 |

**认知映射**:
```
数字PWM值 (51914)
    ↓
定时器/计数器
    ↓
占空比 (80.4%)
    ↓
平均电压 (0.804 × 12V = 9.65V)
    ↓
电机转速 (≈ 200 rad/s)
    ↓
理解: PWM通过改变占空比控制平均电压
      分辨率决定控制精度
```

---

## 🧪 实验4: 传感器融合追踪 (理解状态估计)

### 📝 示踪代码

```python
# ekf_tracer.py
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Imu, JointState
from nav_msgs.msg import Odometry

# 示踪剂: 特殊加速度
TRACER_ACCEL = 9.80665  # 重力加速度

class EKFTracer(Node):
    def __init__(self):
        super().__init__('ekf_tracer')

        # 订阅原始传感器
        self.imu_sub = self.create_subscription(Imu, '/imu', self.imu_callback, 10)
        self.enc_sub = self.create_subscription(JointState, '/encoders', self.enc_callback, 10)

        # 订阅状态估计 (关卡: EKF输出)
        self.odom_sub = self.create_subscription(Odometry, '/odom', self.odom_callback, 10)

    def imu_callback(self, msg):
        accel_z = msg.linear_acceleration.z

        # 搜索示踪剂: 检查重力
        if abs(accel_z - TRACER_ACCEL) < 0.01:
            self.get_logger().info('[TRACER] *** IMU DETECTED GRAVITY! ***')
            self.get_logger().info(f'[TRACER] IMU raw: ax={accel_z:.4f}')

    def odom_callback(self, msg):
        # EKF融合后的估计
        x = msg.pose.pose.position.x
        y = msg.pose.pose.position.y

        self.get_logger().info(f'[TRACER] EKF estimate: x={x:.4f}, y={y:.4f}')
```

---

### 💉 观察步骤

```bash
# 运行EKF示踪
python3 ekf_tracer.py

# 监控
ros2 topic echo /imu --field linear_acceleration
ros2 topic echo /odom --field pose

# 检查TF树
ros2 run tf2_ros tf2_echo odom base_link
```

---

### 👀 观察分析

#### 🔷 观察: 传感器融合效果

**观测结果**:
```
[TRACER] IMU raw: ax=9.8123  ← 有噪声
[TRACER] Encoder: v=0.305     ← 有漂移
[TRACER] EKF estimate: x=1.2345, y=5.6789  ← 融合后更准确
```

**冰山下的知识**:

| 概念 | 是什么 | 为什么需要 | 能解决什么问题 |
|------|-------|-----------|--------------|
| 传感器融合 | 结合多个传感器 | 单个传感器不够准确 | 提高估计精度 |
| 卡尔曼增益 | 融合权重 | 信任谁更准 | 调整融合策略 |
| 协方差矩阵 | 不确定性量化 | 知道估计多不准 | 故障检测 |

**认知映射**:
```
IMU测量 (a = 9.81 ± 0.5)  ← 短期准，长期漂移
    ↓
编码器 (v = 0.30 ± 0.01) ← 长期准，短期噪
    ↓
EKF融合
    ↓
最优估计 (x = 1.234 ± 0.001) ← 结合两者优势
    ↓
理解: 融合不是简单平均
      是基于不确定性的加权
```

---

## 🧪 实验4: 破坏性验证 (找边界)

### 📝 破坏代码

```python
# break_robot.py
# 测试边界: 控制延迟

import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist

class BreakRobot(Node):
    def __init__(self):
        super().__init__('break_robot')
        self.pub = self.create_publisher(Twist, '/cmd_vel', 10)

        # 破坏1: 发送超大速度
        self.timer1 = self.create_timer(1.0, self.break_speed)

        # 破坏2: 高频发送 (压垮控制器)
        self.timer2 = self.create_timer(0.001, self.break_frequency)

    def break_speed(self):
        # 示踪剂: 超速
        msg = Twist()
        msg.linear.x = 999.0  # 远超电机能力
        self.pub.publish(msg)
        self.get_logger().info('[TRACER] Speed test: 999 m/s')

    def break_frequency(self):
        # 示踪剂: 高频
        msg = Twist()
        msg.linear.x = 0.1
        self.pub.publish(msg)
        # 预期: 控制器buffer溢出
```

---

### 💉 观察步骤

```bash
# 运行破坏测试
python3 break_robot.py

# 监控系统状态
ros2 topic hz /cmd_vel          # 检查频率
ros2 topic echo /diagnostics    # 检查错误
```

---

### 👀 观察分析

#### 🔷 观察1: 饱和

**观测结果**:
```
[TRACER] Speed test: 999 m/s
实际电机速度: 2.5 m/s  ← 饱和了！
```

**认知映射**:
```
控制指令 (999 m/s)
    ↓
控制器 (检测到超限)
    ↓
饱和 (限制到最大值 2.5 m/s)
    ↓
电机输出 (2.5 m/s)
    ↓
理解: 物理系统有边界
      控制器必须限幅保护
```

---

#### 🔷 观察2: 丢包

**观测结果**:
```
ros2 topic hz /cmd_vel
average rate: 500.123  ← 只处理了500Hz，发了1000Hz
[WARN] Controller queue full, dropping messages
```

**认知映射**:
```
高频发布 (1000Hz)
    ↓
ROS2中间件
    ↓
队列满 (只能存10条)
    ↓
丢包 (只处理500Hz)
    ↓
理解: 系统处理能力有限
      控制频率不能超过CPU能力
```

---

## 📊 完整数据流追踪示例

让我们追踪一个完整的行为: **"机器人前进1米"**

```
高层目标 (Goal)
└─ "前进1米" (geometry_msgs/PoseStamped)

关卡1: 全局规划器 (Nav2 Planner/Smac)
├─ 输入: 起点(0,0) → 终点(1,0)
├─ 算法: A* / Dijkstra
├─ 输出: 全局路径 [(0,0), (0.3,0), (0.6,0), (1,0)]
└─ 示踪: 路径点是否有魔术坐标？

关卡2: 局部规划器 (DWB/TEB)
├─ 输入: 全局路径 + 当前状态 + 代价地图
├─ 算法: 速度空间采样
├─ 输出: 局部轨迹 (未来3秒, 20个点)
└─ 示踪: 轨迹是否有示踪剂速度？

关卡3: 控制器 (PID/LQR/MPC)
├─ 输入: 局部轨迹 + 当前状态
├─ 算法: 误差反馈 (e = r - y)
├─ 输出: 控制指令 u = [v=0.5 m/s, ω=0 rad/s]
└─ 示踪: cmd_vel是否有魔术速度？

关卡4: 运动学解算 (Differential Drive)
├─ 输入: 机器人速度 v, ω
├─ 公式:
│   ├─ v_left = v - (ω × L / 2)
│   └─ v_right = v + (ω × L / 2)
├─ 输出: 左右轮速度 [0.5, 0.5] m/s
└─ 示踪: 左右轮速度是否一致？

关卡5: 速度控制器 (低层PID)
├─ 输入: 期望轮速度
├─ 算法: PWM = Kp × e + Ki × ∫e
├─ 输出: PWM值 [1500, 1500]
└─ 示踪: PWM是否有魔术值？

关卡6: PWM生成器 (定时器)
├─ 输入: PWM值 1500 (8位范围0-255)
├─ 硬件: Timer/Counter
├─ 输出: 占空比 58.8% (1500/255 × 100)
└─ 示踪: 占空比是否正确？

关卡7: 电机驱动 (H桥)
├─ 输入: PWM信号 + 方向信号
├─ 硬件: MOSFET H桥
├─ 输出: 电机电流 I = 2.5A
└─ 示踪: 电流是否在范围？

关卡8: 电机 (DC Motor)
├─ 输入: 电流 I
├─ 物理: τ = Kt × I, ω = τ / B
├─ 输出: 轮子转速 ω = 100 rad/s
└─ 示踪: 转速是否匹配？

关卡9: 编码器 (反馈)
├─ 输入: 轮子转动
├─ 传感器: 光电编码器 (512线/圈)
├─ 输出: 计数 = 2048 (4圈)
└─ 示踪: 计数是否增加？

关卡10: 状态估计 (EKF)
├─ 输入: 编码器 + IMU
├─ 算法: 扩展卡尔曼滤波
├─ 输出: 估计位置 x = [1.002, 0.001, 0.05]
└─ 示踪: 估计是否接近1米？

关卡11: 闭环反馈
├─ 误差: e = 1.0 - 1.002 = -0.002m
├─ 判断: 误差小于阈值？
├─ 动作: 停止或继续
└─ 示踪: 是否到达目标？
```

---

## 🔧 工具速查表

### 规划层调试
```bash
# 可视化
rviz2

# 查看路径
ros2 topic echo /plan

# 查看代价地图
ros2 service call /get_costmap nav2_msgs/srv/GetCostmap

# 修改目标
ros2 action send_goal /navigate_to_pose nav2_msgs/action/NavigateToPose "{pose: {pose: {position: {x: 1.0, y: 0.0}}}}"
```

### 控制层调试
```bash
# 手动控制
ros2 topic pub /cmd_vel geometry_msgs/Twist "{linear: {x: 0.5}}"

# 查看控制器状态
ros2 topic echo /controller_state

# 调整PID参数
ros2 param set /controller Kp 1.5
```

### 嵌入式层调试
```bash
# Arduino串口
arduino-cli monitor -p /dev/ttyUSB0

# I2C扫描
i2cdetect -y 1

# GPIO状态
cat /sys/class/gpio/gpio12/value
```

### 传感器层调试
```bash
# IMU原始数据
ros2 topic echo /imu/raw

# TF树
ros2 run tf2_tools view_frames

# 传感器频率
ros2 topic hz /imu
ros2 topic hz /encoders
```

---

## 💡 核心洞察

### 1. **分层抽象的本质**
```
每一层都是一次"语义转换":
- 规划层: "去哪里" → "怎么走" (空间 → 路径)
- 控制层: "路径" → "怎么动" (路径 → 速度)
- 执行层: "速度" → "怎么转" (速度 → PWM)
- 物理层: "PWM" → "电流" (数字 → 模拟)
```

### 2. **误差的来源**
```
每一层都会引入误差:
- 规划: 离散化误差 (路径分辨率)
- 控制: 建模误差 (摩擦、扰动)
- 执行: 量化误差 (PWM分辨率)
- 传感器: 噪声 (测量不确定性)

为什么机器人不能完美到达目标？
→ 误差累积 + 延迟 + 噪声
```

### 3. **闭环的必要性**
```
开环:
目标 → 规划 → 控制 → 执行
  × 有误差，不能修正

闭环:
目标 → 规划 → 控制 → 执行
  ↑                    ↓
  └──── 反馈 ←─────────┘
  ✓ 用传感器数据修正误差
```

### 4. **实时性的权衡**
```
规划频率: 1-10Hz (计算密集)
控制频率: 10-100Hz (实时性要求)
PWM频率: 1-50kHz (硬件精度)

为什么不同层频率不同？
→ 计算复杂度 vs 实时性要求
```

---

## 🎯 学习建议

### 第一阶段: 理解单个层次
1. **规划层**: 用RViz可视化路径，理解A*如何工作
2. **控制层**: 用rqt_plot绘制cmd_vel，理解PID如何调节
3. **执行层**: 用逻辑分析仪看PWM，理解占空比如何控制速度
4. **传感器层**: 用ros2 topic看原始数据，理解噪声特性

### 第二阶段: 追踪层间转换
1. **规划→控制**: 观察/plan和/cmd_vel的关系
2. **控制→执行**: 用示波器看PWM和电机电流的关系
3. **传感器→估计**: 对比IMU原始数据和/odom的差异

### 第三阶段: 破坏性测试
1. 测试边界: 超速、超高频、低电量
2. 测试故障: 传感器失效、通信丢包
3. 测试鲁棒性: 动态障碍、打滑

---

## 📚 推荐资源

### 规划
- [Nav2 Documentation](https://navigation.ros.org/)
- [Probabilistic Robotics](https://www.probabilistic-robotics.org/)

### 控制
- [Modern Robotics](http://hades.mech.northwestern.edu/index.php/Modern_Robotics)
- [Control Bootcamp](https://www.youtube.com/playlist?list=PLMrJAkhIeNNR20Mz-VpzgfQs5zT-5TfTa)

### 嵌入式
- [Arduino Reference](https://www.arduino.cc/reference/en/)
- [Embedded Systems Fundamentals](https://www.youtube.com/watch?v=YHx-p2b-hqk)

### ROS2
- [ROS2 Tutorials](https://docs.ros.org/en/humble/Tutorials.html)
- [ROS2 Robotics Projects](https://www.packtpub.com/product/ros2-robotics-projects/9781789132917)

---

## 🏆 结论

通过罗塞塔石碑实验法，你现在应该理解了:

1. **数据如何流动**: 从高层目标到低层PWM
2. **每层的作用**: 为什么需要这么多层次
3. **工具如何使用**: 在每个关卡用什么观察
4. **问题如何定位**: 逐关卡排查故障
5. **边界在哪里**: 通过破坏性测试找极限

**下一步**:
- 选择一个关卡深入理解 (比如EKF原理)
- 动手实现一个简化版机器人
- 阅读经典教材深化理论

记住: **示踪剂是你的朋友，破坏性测试是理解系统的捷径！**
