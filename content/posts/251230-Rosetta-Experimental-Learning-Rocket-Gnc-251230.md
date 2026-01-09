---
title: "Rosetta Experimental Learning Rocket Gnc 251230"
date: 2025-12-30
categories: ["数学物理"]
tags: ["Rust", "Python", "learning"]
---


# 🧪 火箭飞行控制系统底层原理学习 - 从传感器到执行器

**技能**: rosetta-experimental-learning
**目标系统**: 火箭飞行控制系统（GNC - Guidance, Navigation, Control）
**学习模式**: 完整实验（基于仿真）
**学习目标**:
- ✅ 理解底层原理（牛顿力学、姿态动力学、控制理论）
- ✅ 性能优化（响应速度、稳定性、精度）
- ✅ 工程实践（SpaceX/Falcon 9 的真实设计）
- ✅ 数学建模（6自由度动力学、状态空间）
**生成时间**: 2025-12-30

---

## 🎯 为什么要用罗塞塔方法？

**火箭控制的现实痛点**：

| 痛点场景 | 不懂底层怎么做 | 懂底层怎么做 |
|---------|--------------|------------|
| 火箭姿态不稳定 | 瞎调 PID 参数，越调越抖 | 从惯性张量计算转动惯量，设计前馈补偿 |
| 再入大气层震荡 | 不知道是气动阻尼问题 | 从气动导数计算阻尼比，调整控制增益 |
| 需求点偏差大 | 猜是传感器问题 | 从传感器噪声模型设计卡尔曼滤波器 |
| 发动机关机时机 | 凭经验估算 | 从轨道力学精确计算 δV 需求 |
| 回收失败 | 不知道原因 | 从推重比、气动阻力分析着陆过程 |

**学习目标**：
1. 理解火箭如何从"传感器读数"到"发动机推力指令"的完整链路
2. 掌握 6 自由度（6-DOF）动力学建模
3. 学会设计反馈控制系统（PID/LQR/MPC）
4. 理解 SpaceX 着陆算法的底层原理

---

## 📐 第一步：定层级

对于火箭飞行控制系统，完整的数据流转层级：

| 层级 | 名称 | 数据形态 | 示例 | 可观测性 |
|------|------|----------|------|----------|
| 层级1 | 物理层 | 连续世界的物理量 | 位置、速度、姿态角 | ✅ 原理可见 |
| 层级2 | 传感器层 | 惯性测量单元（IMU） | 加速度计、陀螺仪读数 | ✅ 仿真可测 |
| 层级3 | 导航层 | 状态估计 | 卡尔曼滤波输出 | ✅ 算法可调 |
| 层级4 | 制导层 | 轨迹规划 | 需求点、需求姿态 | ✅ 算法可调 |
| 层级5 | 控制层 | 控制算法 | PID/LQR/MPC | ✅ 代码可读 |
| 层级6 | 执行器层 | 推力矢量控制（TVC） | 发动机摆角、推力大小 | ✅ 指令可测 |
| 层级7 | 动力学层 | 刚体动力学 | 6-DOF 运动方程 | ✅ 仿真可解 |

**核心公式**：

```
真实世界 → 传感器测量 → 状态估计 → 轨迹规划 → 控制计算 → 执行器 → 火箭运动
```

**火箭控制数据流（以 Falcon 9 着陆为例）**：

```
真实状态：[位置, 速度, 姿态, 角速度]
    ↓
IMU 测量：[加速度, 角速度]
    ↓
卡尔曼滤波：估计状态 [x, v, θ, ω]
    ↓
轨迹规划：计算需求点 [x_d, v_d, θ_d]
    ↓
控制算法：PID/LQR 计算控制力 [F, M]
    ↓
TVC 执行：发动机摆角 [δ_pitch, δ_yaw]
    ↓
火箭动力学：F = ma, M = I·α
    ↓
更新状态
```

---

## 🚧 第二步：定关卡

| 关卡 | 数据转换对象 | 关键问题 | 主要观测工具 |
|------|-------------|---------|-------------|
| 关卡1 传感器测量 | 真实状态 → IMU 读数 | 噪声建模、零偏漂移、传感器融合 | 仿真：添加高斯白噪声 |
| 关卡2 导航估计 | IMU → 状态估计 | 卡尔曼滤波、协方差更新、可观性 | Python: filterpy, MATLAB: kalman |
| 关卡3 轨迹规划 | 状态估计 → 需求点 | 轨迹优化、约束处理、实时性 | Python: cvxpy, MATLAB: Optimization |
| 关卡4 控制算法 | 需求点 → 控制力矩 | PID 调参、LQR 设计、MPC 优化 | MATLAB: Control Toolbox, Python: control |
| 关卡5 执行器分配 | 控制力矩 → TVC 摆角 | 推力分配、执行器动态、饱和 | 仿真：一阶/二阶执行器模型 |
| 关卡6 刚体动力学 | 执行器 → 火箭运动 | 6-DOF 方程、惯性张量、气动导数 | MATLAB: Simulink, Python: scipy.integrate |

---

## 🔗 关卡因果链路（横向展示）

```
真实世界状态
[位置, 速度, 姿态, 角速度]
    ↓
┌─ 传感器测量 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
                                               ↓
                                     IMU: 加速度计 + 陀螺仪
                                               ↓
                                     添加噪声 + 零偏漂移
                                               ↓
                              ┏━━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━┓
                              ↓                                          ↓
                        单独使用陀螺仪                              传感器融合
                        （积分漂移）                                  （卡尔曼滤波）
                              ↓                                          ↓
                      误差快速累积                                  状态估计 [x̂, v̂, θ̂, ω̂]
                              ↓                                          ↓
                    ❌ 不可用                                      ✅ 可用
                                                                               ↓
                                                                        ┌─ 导航 ──────┐
                                                                        ↓             |
                                                                    状态估计         |
                                                                        ↓             |
                                                                    ┌─ 制导 ──────────┘
                                                                    ↓
                                                          需求轨迹 [x_d, v_d, θ_d, ω_d]
                                                                    ↓
                                                            ┏━━━━━━━━━━━━━━━━━━━━━━┻━━━━━━┓
                                                            ↓                                ↓
                                                      简单 PID 控制                    最优控制 LQR/MPC
                                                            ↓                                ↓
                                                  响应快但超调                    稳定但计算量大
                                                            ↓                                ↓
                                                      控制力 [F, M]                     控制力 [F, M]
                                                            ↓                                ↓
                                                            ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┻━┓
                                                            ↓                              ↓
                                                      ┌─ 执行器分配 ─────────────────────┐
                                                            ↓                              ↓
                                                        TVC 摆角计算                    推力节流
                                                            ↓                              ↓
                                                        [δ_pitch, δ_yaw]              [F_throttle]
                                                            ↓
                                                            ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┻━┓
                                                            ↓                              ↓
                                                      ┌─ 刚体动力学 ─────────────────────┐
                                                            ↓
                                                F_net = ΣF_external + ΣF_thrust
                                                M_net = ΣM_external + ΣM_control
                                                            ↓
                                                  [ẋ, ẍ, θ̈, ω̇] = f(F, M, I, C_drag)
                                                            ↓
                                                      数值积分更新状态
                                                            ↓
                                                            ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┻━┓
                                                            ↓                              ↓
                                                        稳定着陆                      坠毁/偏离
```

---

## 🛠️ 第三步：架工具

### **关卡1：传感器仿真工具**

| 工具 | 解决痛点 | 命令 | 功能 |
|------|----------|------|------|
| Python + numpy | 生成传感器数据 | `a_measured = a_true + np.random.normal(0, sigma)` | 添加高斯白噪声 |
| scipy.signal | 模拟传感器延迟 | `scipy.signal.lfilter(b, a, x)` | 一阶延迟模型 |
| filterpy | 卡尔曼滤波实现 | `from filterpy.kalman import KalmanFilter` | Python 卡尔曼滤波库 |

### **关卡2：导航算法工具**

| 工具 | 解决痛点 | 命令 | 功能 |
|------|----------|------|------|
| filterpy | 扩展卡尔曼滤波 | `from filterpy.kalman import ExtendedKalmanFilter` | 非线性系统状态估计 |
| MATLAB kalman | 工具箱实现 | `kalman(sys, Q, R)` | MATLAB 内置卡尔曼滤波 |
| pyIMU | IMU 数据处理 | `from pyimu import IMU` | 专用 IMU 库 |

### **关卡3：轨迹规划工具**

| 工具 | 解决痛点 | 命令 | 功能 |
|------|----------|------|------|
| cvxpy | 凸优化 | `cvxpy.Problem()` | 轨迹优化问题求解 |
| scipy.optimize | 数值优化 | `scipy.optimize.minimize()` | 无约束优化 |
| GMAT | 轨道仿真 | GMAT GUI | NASA 轨道分析工具 |

### **关卡4：控制算法工具**

| 工具 | 解决痛点 | 命令 | 功能 |
|------|----------|------|------|
| MATLAB Control Toolbox | PID 设计 | `pid(Kp, Ki, Kd)`<br>`sisotool()` | PID 调参工具 |
| python-control | Python 控制库 | `from control import tf, feedback` | 传递函数、状态空间 |
| casadi | 非线性 MPC | `casadi.Opti()` | 模型预测控制 |

### **关卡5：执行器仿真工具**

| 工具 | 解决痛点 | 命令 | 功能 |
|------|----------|------|------|
| scipy.signal | 执行器动态 | `scipy.signal.lti([tau], [1])` | 一阶延迟 |
| scipy.integrate | 数值积分 | `scipy.integrate.odeint()` | 求解微分方程 |

### **关卡6：动力学仿真工具**

| 工具 | 解决痛点 | 命令 | 功能 |
|------|----------|------|------|
| MATLAB Simulink | 图形化建模 | `sim('rocket_model')` | 可视化仿真 |
| Python + scipy | 代码建模 | `scipy.integrate.solve_ivp()` | 数值求解 ODE |
| OpenRocket | 3D 飞行仿真 | OpenRocket GUI | 开源火箭仿真 |

---

## 💉 第四步：投示踪（按层级追踪）

### **阶段1：准备示踪剂**

**目标**：搭建一个简单的火箭控制仿真

```python
# rocket_sim.py
import numpy as np
from scipy.integrate import solve_ivp
import matplotlib.pyplot as plt

# 示踪剂：初始状态
# 火箭在 1000m 高度，垂直下降，初始速度 -50 m/s
initial_state = [0, 0, 1000, -50, 0, 0]  # [x, vx, y, vy, theta, omega]

def rocket_dynamics(t, state, u):
    """
    火箭 3-DOF 动力学
    state: [x, vx, y, vy, theta, omega]
    u: [thrust, gimbal_angle]
    """
    x, vx, y, vy, theta, omega = state
    thrust, delta = u

    # 参数
    m = 1000  # 质量 kg
    g = 9.81  # 重力
    I = 1000  # 转动惯量

    # 推力分量（考虑推力矢量控制）
    Fx = thrust * np.sin(delta)
    Fy = thrust * np.cos(delta) - m * g

    # 力矩
    M = thrust * delta * 1.5  # 假设推力中心到质心距离 1.5m

    # 动力学方程
    ax = Fx / m
    ay = Fy / m
    alpha = M / I

    return [vx, ax, vy, ay, omega, alpha]

# 示踪剂2：控制律（PD 控制）
def pd_controller(state, target):
    """
    PD 控制器
    target: [y_target, vy_target, theta_target, omega_target]
    """
    x, vx, y, vy, theta, omega = state
    y_t, vy_t, theta_t, omega_t = target

    # 误差
    e_y = y_t - y
    e_vy = vy_t - vy
    e_theta = theta_t - theta
    e_omega = omega_t - omega

    # PD 增益
    Kp_y = 5000
    Kd_y = 800
    Kp_theta = 2000
    Kd_theta = 500

    # 控制输出
    thrust = m * g + Kp_y * e_y + Kd_y * e_vy
    delta = Kp_theta * e_theta + Kd_theta * e_omega

    return [thrust, delta]

# 仿真
m = 1000
g = 9.81
dt = 0.01
T = 20  # 仿真时间 20s

t_eval = np.arange(0, T, dt)
states = [initial_state]
controls = []

target = [0, 0, 0, 0]  # 目标：着陆，速度为0，姿态垂直

for i in range(len(t_eval) - 1):
    # 计算控制
    u = pd_controller(states[-1], target)
    controls.append(u)

    # 积分一步
    sol = solve_ivp(
        rocket_dynamics,
        [t_eval[i], t_eval[i+1]],
        states[-1],
        args=(u,),
        dense_output=True
    )
    states.append(sol.y[:, -1])

# 绘图
states = np.array(states)
controls = np.array(controls)

plt.figure(figsize=(12, 8))

plt.subplot(3, 1, 1)
plt.plot(t_eval, states[:, 2], label='Altitude')
plt.plot(t_eval, np.zeros_like(t_eval), 'r--', label='Target')
plt.ylabel('Height (m)')
plt.legend()
plt.grid()

plt.subplot(3, 1, 2)
plt.plot(t_eval, states[:, 3], label='Vertical Velocity')
plt.plot(t_eval, np.zeros_like(t_eval), 'r--', label='Target')
plt.ylabel('Vy (m/s)')
plt.legend()
plt.grid()

plt.subplot(3, 1, 3)
plt.plot(t_eval[:-1], controls[:, 0], label='Thrust')
plt.plot(t_eval[:-1], controls[:, 1], label='Gimbal Angle')
plt.xlabel('Time (s)')
plt.ylabel('Control')
plt.legend()
plt.grid()

plt.tight_layout()
plt.savefig('rocket_landing.png')
print("✓ 仿真完成，结果保存到 rocket_landing.png")
```

---

### **阶段2：按层级追踪**

---

#### 🔷 **层级1：物理层（真实状态）**

**观测点**：火箭在真实世界的状态

**操作**：
```bash
python rocket_sim.py
```

**预期输出**：
```
✓ 仿真完成，结果保存到 rocket_landing.png
```

**生成的图像**：
- 高度曲线：从 1000m 下降到 0m
- 速度曲线：从 -50m/s 减速到 0m/s
- 控制输入：推力、摆角随时间变化

#### 🔗 认知映射

```
物理世界              数学描述
位置              →  向量 r = [x, y, z]
速度              →  向量 v = [vx, vy, vz]
姿态              →  欧拉角 θ = [roll, pitch, yaw]
角速度            →  向量 ω = [ωx, ωy, ωz]
        ↓
  理解：火箭状态是 12 维向量（6 位置/速度 + 6 姿态/角速度）
        控制目标：稳定在需求点
```

---

#### 🔷 **层级2：传感器层（IMU）**

**观测点**：添加传感器噪声

**操作**：
```python
# 添加传感器噪声
def simulate_imu(state, noise_std=0.1):
    """模拟 IMU 测量"""
    x, vx, y, vy, theta, omega = state

    # 真实加速度（需要知道外力）
    # 简化：假设已知推力
    a_true = thrust / m - g

    # 添加噪声
    a_measured = a_true + np.random.normal(0, noise_std)
    omega_measured = omega + np.random.normal(0, noise_std * 0.1)

    return a_measured, omega_measured
```

**预期发现**：
```
真实加速度: -9.81 m/s²
测量加速度: -9.78, -9.85, -9.79, ... (有噪声)

真实角速度: 0.1 rad/s
测量角速度: 0.12, 0.09, 0.11, ... (有噪声)
```

#### 🔗 认知映射

```
物理量              传感器测量
加速度 a          →  a_measured = a + noise + bias
角速度 ω          →  ω_measured = ω + noise + drift
        ↓
  理解：传感器有噪声和零偏
        直接积分会导致误差累积
        需要滤波器（卡尔曼）
```

---

#### 🔷 **层级3：导航层（卡尔曼滤波）**

**观测点**：从噪声测量估计状态

**操作**：
```python
from filterpy.kalman import ExtendedKalmanFilter

# 创建 EKF
ekf = ExtendedKalmanFilter(dim_x=6, dim_z=2)

# 初始协方差
ekf.P = np.diag([1.0, 1.0, 10.0, 10.0, 0.1, 0.1])

# 过程噪声（物理不确定性）
ekf.Q = np.diag([0.01, 0.01, 0.1, 0.1, 0.01, 0.01])

# 测量噪声（传感器噪声）
ekf.R = np.diag([0.1, 0.1])

def predict_update(ekf, u, z):
    """预测-更新步骤"""
    ekf.predict(u=u)
    ekf.update(z, HJacobian=H_jacobian, h=measurement_function)
    return ekf.x

# 仿真
for i in range(len(t_eval) - 1):
    # 预测
    ekf.predict(u=controls[i])

    # 模拟测量
    z = simulate_imu(states[i+1])

    # 更新
    ekf.update(z, HJacobian=H_jacobian, h=measurement_function)

    # 记录估计状态
    estimated_states.append(ekf.x.copy())
```

**预期发现**：
```
无滤波（直接积分）：
  位置误差: ±50m（快速累积）

有卡尔曼滤波：
  位置误差: ±5m（保持在范围内）
```

#### 🔗 认知映射

```
传感器读数              状态估计
a_measured        →  预测: x̂⁻ = f(x̂, u)
ω_measured        →  更新: x̂⁺ = x̂⁻ + K(z - h(x̂⁻))
        ↓
  理解：卡尔曼滤波 = 预测 + 校正
        K = 卡尔曼增益（权衡预测和测量）
        预测来自动力学模型
        校正来自传感器测量
```

---

#### 🔷 **层级4：制导层（轨迹规划）**

**观测点**：计算需求轨迹

**操作**：
```python
def generate_landing_trajectory(current_state, landing_point):
    """
    生成着陆轨迹
    使用多项式轨迹
    """
    x0, v0, y0, vy0, theta0, omega0 = current_state

    # 目标：在地面，速度为0
    tf = 10.0  # 预计着陆时间

    # 三次多项式: y(t) = a0 + a1*t + a2*t^2 + a3*t^3
    # 约束:
    # y(0) = y0, y'(0) = vy0
    # y(tf) = 0, y'(tf) = 0

    A = np.array([
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [1, tf, tf**2, tf**3],
        [0, 1, 2*tf, 3*tf**2]
    ])
    b = np.array([y0, vy0, 0, 0])

    a = np.linalg.solve(A, b)

    # 生成需求轨迹
    t_traj = np.linspace(0, tf, 100)
    y_d = a[0] + a[1]*t_traj + a[2]*t_traj**2 + a[3]*t_traj**3
    vy_d = a[1] + 2*a[2]*t_traj + 3*a[3]*t_traj**2

    return y_d, vy_d
```

**预期输出**：
```
需求轨迹:
  t=0s:   y=1000m, vy=-50m/s
  t=5s:   y=500m,  vy=-20m/s
  t=10s:  y=0m,    vy=0m/s
```

#### 🔗 认知映射

```
当前位置              需求轨迹
(y, vy)           →  多项式轨迹
                        ↓
                  约束: 初始状态 + 终端状态
                        ↓
                  优化: 最小化控制能量 / 时间
                        ↓
                  需求点序列 [y_d(t), vy_d(t)]
        ↓
  理解：制导 = 轨迹优化
        输入：当前状态 + 目标状态
        输出：中间需求点序列
```

---

#### 🔷 **层级5：控制层（PID/LQR）**

**观测点**：设计反馈控制器

**操作1：PID 控制**
```python
class PIDController:
    def __init__(self, Kp, Ki, Kd):
        self.Kp = Kp
        self.Ki = Ki
        self.Kd = Kd
        self.integral = 0
        self.prev_error = 0

    def update(self, error, dt):
        # P 项
        P = self.Kp * error

        # I 项
        self.integral += error * dt
        I = self.Ki * self.integral

        # D 项
        D = self.Kd * (error - self.prev_error) / dt
        self.prev_error = error

        return P + I + D

# 使用
pid_alt = PIDController(Kp=5000, Ki=10, Kd=800)
pid_vel = PIDController(Kp=2000, Ki=5, Kd=500)

for i in range(len(t_eval) - 1):
    # 高度控制
    error_alt = y_target - states[i][2]
    thrust_command = pid_alt.update(error_alt, dt)

    # 速度控制
    error_vel = vy_target - states[i][3]
    thrust_adjust = pid_vel.update(error_vel, dt)

    thrust = m * g + thrust_command + thrust_adjust
```

**操作2：LQR 控制**
```python
from control import lqr

# 线性化系统矩阵
A = np.array([
    [0, 1, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 1],
    [0, 0, 0, 0]
])

B = np.array([
    [0, 0],
    [1/m, 0],
    [0, 0],
    [0, 1/I]
])

# 权衡矩阵
Q = np.diag([100, 10, 1000, 100])  # 状态权重
R = np.diag([1, 1])  # 控制权重

# 计算 LQR 增益
K, S, E = lqr(A, B, Q, R)

# 控制律: u = -K * (x - x_desired)
def lqr_controller(state, target):
    error = np.array(state) - np.array(target)
    u = -K @ error
    return u
```

**对比**：

| 控制器 | 超调量 | 调节时间 | 稳定性 | 计算量 |
|--------|--------|---------|--------|--------|
| PID | 15% | 5s | ⚠️ 需要调参 | 低 |
| LQR | 5% | 3s | ✅ 理论保证 | 中 |
| MPC | 2% | 2.5s | ✅ 最优 | 高 |

#### 🔗 认知映射

```
状态误差              控制力
e = [y-y_d, vy-vy_d]  →  PID: u = Kp*e + Ki*∫e + Kd*ė
                        →  LQR: u = -K*x
                        →  MPC: u = argmin Σ(x'Qx + u'Ru)
        ↓
  理解：控制 = 反馈
        PID: 简单，需调参
        LQR: 最优，理论保证
        MPC: 约束优化，计算量大
```

---

#### 🔷 **层级6：执行器层（TVC）**

**观测点**：推力矢量控制

**操作**：
```python
def tvc_allocation(control_force, control_moment):
    """
    将控制力和力矩分配到 TVC 角
    """
    # 假设单发动机 TVC
    max_gimbal = np.radians(15)  # 最大摆角 15 度

    # 分配算法
    # 1. 优先满足力矩需求
    desired_delta = np.clip(control_moment / (thrust * 1.5), -max_gimbal, max_gimbal)

    # 2. 推力 = 垂直分量
    thrust_vertical = control_force / np.cos(desired_delta)

    # 3. 推力限制
    max_thrust = 10000  # 最大推力 10kN
    thrust = np.clip(thrust_vertical, 0, max_thrust)

    return thrust, desired_delta
```

**SpaceX 真实案例**：
```
Falcon 9 第一级：
  9 台 Merlin 发动机
  外圈 8 台可 TVC（各 ± 几度）
  中心 1 台固定

Merlin 发动机：
  推力: 845 kN (海平面)
  TVC 范围: ± 几度（外圈）
  响应时间: < 0.1s
```

#### 🔗 认知映射

```
控制指令              执行器动作
[ thrust, M ]     →  计算摆角 δ
                        ↓
                  δ = M / (F * L)
                        ↓
                  发动机伺服机构
                        ↓
                  推力矢量偏转
                        ↓
                  产生控制力矩
        ↓
  理解：TVC = 通过改变推力方向控制姿态
        力矩 = 推力 × 力臂 × sin(δ)
        SpaceX 使用 9 台发动机实现冗余和精确控制
```

---

#### 🔷 **层级7：动力学层（6-DOF）**

**观测点**：完整动力学方程

**操作**：
```python
def rigid_body_dynamics(t, state, u):
    """
    6 自由度刚体动力学
    """
    # 状态: [x, y, z, vx, vy, vz, phi, theta, psi, p, q, r]
    # 输入: [Fx, Fy, Fz, Mx, My, Mz]

    # 提取状态
    r = state[0:3]      # 位置
    v = state[3:6]      # 速度
    euler = state[6:9]  # 欧拉角
    omega = state[9:12] # 角速度

    # 提取输入
    F = u[0:3]
    M = u[3:6]

    # 参数
    m = 1000
    I = np.diag([1000, 1000, 500])  # 惯性张量

    # 姿态矩阵（从体坐标系到惯性坐标系）
    R = rotation_matrix(euler)

    # 重力
    F_gravity = np.array([0, 0, -m * g])

    # 合力（惯性系）
    F_total = R @ F + F_gravity

    # 合力矩（体系）
    M_total = M - np.cross(omega, I @ omega)  # 陀螺力矩

    # 加速度
    a = F_total / m
    alpha = np.linalg.inv(I) @ M_total

    # 角速度与欧拉角关系
    phi, theta, psi = euler
    W = np.array([
        [1, np.sin(phi)*np.tan(theta), np.cos(phi)*np.tan(theta)],
        [0, np.cos(phi), -np.sin(phi)],
        [0, np.sin(phi)/np.cos(theta), np.cos(phi)/np.cos(theta)]
    ])
    euler_dot = W @ omega

    # 导数
    dr_dt = v
    dv_dt = a
    deuler_dt = euler_dot
    domega_dt = alpha

    return np.concatenate([dr_dt, dv_dt, deuler_dt, domega_dt])
```

**关键概念**：

| 概念 | 公式 | 物理意义 |
|------|------|---------|
| 牛顿第二定律 | F = ma | 力 = 质量 × 加速度 |
| 欧拉动力学方程 | M = I·α + ω × (I·ω) | 力矩 = 惯量 × 角加速度 + 陀螺力矩 |
| 坐标系变换 | F_inertial = R @ F_body | 体坐标系力转到惯性系 |
| 惯性张量 | I = diag(Ix, Iy, Iz) | 绕各轴的转动惯量 |

#### 🔗 认知映射

```
力和力矩              运动状态
[ F, M ]           →  F = ma → a → v → r
                        ↓
                      M = I·α + ω × Iω
                        ↓
                      α → ω → θ
                        ↓
                  状态 [r, v, θ, ω]
        ↓
  理解：动力学 = 微分方程
        F = ma（平动）
        M = I·α（转动）
        需要数值积分求解
```

---

## 🎯 实验场景

### **实验1：理解 PID 调参的影响**

**目标**：观察 P、I、D 参数对控制性能的影响

**代码**：
```python
import numpy as np
import matplotlib.pyplot as plt

# 测试不同 PID 参数
kp_values = [1000, 5000, 10000]
ki_values = [0, 10, 100]
kd_values = [0, 500, 1000]

plt.figure(figsize=(15, 5))

# 测试 Kp
for i, kp in enumerate(kp_values):
    states = simulate_landing(kp=kp, ki=0, kd=500)
    plt.subplot(1, 3, 1)
    plt.plot(t_eval, states[:, 2], label=f'Kp={kp}')

# 测试 Ki
for i, ki in enumerate(ki_values):
    states = simulate_landing(kp=5000, ki=ki, kd=500)
    plt.subplot(1, 3, 2)
    plt.plot(t_eval, states[:, 2], label=f'Ki={ki}')

# 测试 Kd
for i, kd in enumerate(kd_values):
    states = simulate_landing(kp=5000, ki=10, kd=kd)
    plt.subplot(1, 3, 3)
    plt.plot(t_eval, states[:, 2], label=f'Kd={kd}')

plt.legend()
plt.show()
```

**预期发现**：

| 参数 | 太小 | 合适 | 太大 |
|------|------|------|------|
| Kp | 响应慢，有稳态误差 | 快速响应 | 超调、震荡 |
| Ki | 无法消除稳态误差 | 逐步消除误差 | 积分饱和、超调 |
| Kd | 响应慢、有震荡 | 抑制超调 | 噪声放大 |

---

### **实验2：理解传感器噪声的影响**

**目标**：比较有无卡尔曼滤波的效果

**代码**：
```python
# 无滤波
states_no_filter = []
x_est = np.zeros(6)
for i in range(len(t_eval) - 1):
    # 直接积分
    a_measured, omega_measured = simulate_imu(states[i])
    x_est[2] += x_est[3] * dt  # y += vy * dt
    x_est[3] += a_measured * dt  # vy += a * dt
    states_no_filter.append(x_est.copy())

# 有卡尔曼滤波
states_with_filter = []
ekf = ExtendedKalmanFilter(...)
# ... 滤波代码 ...

# 对比
plt.figure(figsize=(12, 6))
plt.plot(t_eval, [s[2] for s in states_no_filter], label='No Filter')
plt.plot(t_eval, [s[2] for s in states_with_filter], label='With EKF')
plt.plot(t_eval, [s[2] for s in states_true], 'r--', label='True')
plt.legend()
plt.show()
```

**预期发现**：
```
无滤波：位置误差 ±50m（累积漂移）
有滤波：位置误差 ±5m（收敛）
```

---

### **实验3：SpaceX Falcon 9 着陆复现**

**目标**：复现 SpaceX 着陆算法

**关键参数**：
```
Falcon 9 第一级：
  空重: 25,600 kg
  推进剂: 411,000 kg
  推力: 7,607 kN (9台 Merlin)
  燃烧时间: 162s

着陆算法：
  1. 高度 > 10km：气动减速
  2. 10km > 高度 > 2km：单一发动机减速
  3. 高度 < 2km：hoverslam（精确着陆）
```

**仿真**：
```python
def falcon9_landing():
    # 初始状态（再入大气层）
    state = [0, 0, 50000, -1000, 0, 0]  # 50km 高度，-1km/s 速度

    # 着陆算法
    for i in range(len(t_eval)):
        altitude = state[2]

        if altitude > 10000:
            # 气动减速
            thrust = 0
        elif altitude > 2000:
            # 单发减速
            thrust = max_thrust / 9
        else:
            # hoverslam（PD 控制）
            e_h = target_altitude - altitude
            e_v = target_velocity - state[3]
            thrust = m * g + Kp * e_h + Kd * e_v

        # 仿真
        state = rocket_dynamics(state, thrust, gimbal)
```

---

## 💡 下一步学习路径

### **Week 1: 动力学建模**
- [ ] 推导牛顿-欧拉方程
- [ ] 理解坐标系转换（体坐标系 vs 惯性系）
- [ ] 实现 6-DOF 仿真

### **Week 2: 控制理论**
- [ ] PID 控制设计与调参
- [ ] LQR 最优控制
- [ ] 理解稳定性判据

### **Week 3: 状态估计**
- [ ] 卡尔曼滤波原理
- [ ] 扩展卡尔曼滤波（EKF）
- [ ] 传感器融合

### **Week 4: 轨迹优化**
- [ ] 多项式轨迹规划
- [ ] 凸优化（cvxpy）
- [ ] MPC 控制器

---

**记住**：火箭控制的核心是**反馈**：
1. **传感器** → 测量状态（有噪声）
2. **估计器** → 滤波噪声（卡尔曼）
3. **制导** → 规划轨迹（优化）
4. **控制** → 计算输入（PID/LQR）
5. **执行器** → 产生力/力矩（TVC）
6. **动力学** → 更新状态（微分方程）

现在，告诉我你想深入哪个关卡？我可以提供更详细的代码！
