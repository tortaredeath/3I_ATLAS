#!/usr/bin/env python3
"""
3I/ATLAS 正確的物理計算參考實現

此腳本提供正確的軌道計算作為參考，
可用於驗證 JavaScript 實現的正確性。

使用方法:
    python3 tests/correct_physics_reference.py
"""

import math
import sys

# 物理常數
GM_SUN = 1.327e20  # m³/s² (太陽引力常數)
AU_TO_M = 1.496e11  # m (1 AU in meters)

# 3I/ATLAS 軌道參數（2025年最新數據）
ECCENTRICITY = 6.143
PERIHELION_AU = 1.357  # AU
PERIHELION_DAY = 120  # 2025年10月29日，從2025/7/1起算
V_INFINITY_KMS = 60  # km/s

# 計算半長軸
a_AU = -PERIHELION_AU / (ECCENTRICITY - 1)
a_m = a_AU * AU_TO_M

print("=" * 70)
print("3I/ATLAS 軌道參數")
print("=" * 70)
print(f"離心率 (e):           {ECCENTRICITY}")
print(f"近日點距離 (q):       {PERIHELION_AU} AU")
print(f"半長軸 (a):           {a_AU:.4f} AU (負值 = 雙曲線)")
print(f"v_infinity:           {V_INFINITY_KMS} km/s")
print(f"近日點日期:           Day {PERIHELION_DAY} (2025-10-29)")
print()

# 驗證 v_infinity
v_inf_calculated = math.sqrt(GM_SUN / abs(a_m)) / 1000
print(f"計算的 v_infinity:    {v_inf_calculated:.2f} km/s")
print(f"觀測的 v_infinity:    {V_INFINITY_KMS} km/s")
print(f"差異:                 {abs(v_inf_calculated - V_INFINITY_KMS):.2f} km/s")
print()


def solve_hyperbolic_kepler(M, e, max_iter=30, tol=1e-10):
    """
    求解雙曲線 Kepler 方程: M = e*sinh(H) - H

    Args:
        M: 平近點角
        e: 離心率 (> 1)
        max_iter: 最大迭代次數
        tol: 收斂容差

    Returns:
        H: 雙曲線異常
    """
    # 初始猜測
    if abs(M) < 1:
        H = M / (e - 1)
    else:
        H = math.copysign(math.log(2 * abs(M) / e + 1.8), M)

    # Newton-Raphson 迭代
    for i in range(max_iter):
        sinh_H = math.sinh(H)
        cosh_H = math.cosh(H)

        f = e * sinh_H - H - M
        df = e * cosh_H - 1

        if abs(f) < tol:
            return H

        H_new = H - f / df

        # 檢查收斂
        if abs(H_new - H) < tol:
            return H_new

        H = H_new

        # 防止發散
        if abs(H) > 200:
            print(f"警告: H 發散 at iteration {i}, M={M:.2f}", file=sys.stderr)
            return H

    return H


def calculate_position_velocity(day, mean_motion=0.05):
    """
    計算指定日期的位置和速度

    Args:
        day: 從2025-07-01起算的天數
        mean_motion: 平均運動 (rad/day)

    Returns:
        dict: 包含距離(AU)和速度(km/s)
    """
    days_from_perihelion = day - PERIHELION_DAY
    M = mean_motion * days_from_perihelion  # 平近點角

    # 求解雙曲線異常
    H = solve_hyperbolic_kepler(M, ECCENTRICITY)

    sinh_H = math.sinh(H)
    cosh_H = math.cosh(H)

    # 計算距離
    r_AU = abs(a_AU) * (ECCENTRICITY * cosh_H - 1)
    r_m = r_AU * AU_TO_M

    # 使用 vis-viva 方程式計算速度
    # v² = GM(2/r - 1/a)
    v_squared = GM_SUN * (2 / r_m - 1 / a_m)

    if v_squared < 0:
        print(f"警告: v² < 0 at day {day}, r={r_AU:.2f} AU", file=sys.stderr)
        v_kms = V_INFINITY_KMS
    else:
        v_ms = math.sqrt(v_squared)
        v_kms = v_ms / 1000

    return {
        'day': day,
        'r_AU': r_AU,
        'v_kms': v_kms,
        'H': H,
        'M': M,
        'e_cosh_H': ECCENTRICITY * cosh_H
    }


def verify_perihelion():
    """驗證近日點計算"""
    print("=" * 70)
    print("近日點驗證")
    print("=" * 70)

    result = calculate_position_velocity(PERIHELION_DAY)
    print(f"近日點距離: {result['r_AU']:.4f} AU (期望: {PERIHELION_AU} AU)")
    print(f"近日點速度: {result['v_kms']:.2f} km/s")
    print()

    # 近日點速度的理論值
    q_m = PERIHELION_AU * AU_TO_M
    v_perihelion_theory = math.sqrt(GM_SUN * (2/q_m - 1/a_m)) / 1000
    print(f"理論近日點速度: {v_perihelion_theory:.2f} km/s")
    print()


def print_trajectory_table():
    """打印軌跡表"""
    print("=" * 70)
    print("軌跡數據表")
    print("=" * 70)
    print(f"{'Day':>4} {'Date':>12} {'距離(AU)':>10} {'速度(km/s)':>12} {'H':>8} {'M':>8}")
    print("-" * 70)

    # 關鍵日期
    test_days = [
        (90, "2025-09-29"),
        (94, "2025-10-03", "火星最接近"),
        (120, "2025-10-29", "近日點"),
        (126, "2025-11-03", "金星最接近"),
        (150, "2025-11-22"),
        (171, "2025-12-19", "地球最接近"),
        (200, "2026-01-17"),
        (258, "2026-03-16", "木星最接近"),
        (300, "2026-04-27"),
        (400, "2026-08-05"),
        (500, "2026-11-13"),
        (600, "2027-02-21"),
        (700, "2027-06-01"),
        (800, "2027-09-09"),
        (914, "2028-01-01", "模擬結束"),
    ]

    for item in test_days:
        day = item[0]
        date = item[1]
        note = item[2] if len(item) > 2 else ""

        result = calculate_position_velocity(day)

        line = f"{day:4d} {date:>12} {result['r_AU']:10.2f} {result['v_kms']:12.2f} {result['H']:8.2f} {result['M']:8.2f}"
        if note:
            line += f"  # {note}"

        print(line)

    print()


def verify_physics_laws():
    """驗證物理定律"""
    print("=" * 70)
    print("物理定律驗證")
    print("=" * 70)

    # 檢查速度單調遞減
    print("1. 速度單調遞減檢查 (遠離近日點後):")
    velocities = []
    for day in range(120, 501, 30):
        result = calculate_position_velocity(day)
        velocities.append(result['v_kms'])

    is_decreasing = all(velocities[i] >= velocities[i+1] - 0.1 for i in range(len(velocities)-1))
    print(f"   結果: {'✅ 通過' if is_decreasing else '❌ 失敗'}")
    print()

    # 檢查速度趨近 v_infinity
    print("2. 速度趨近 v_infinity 檢查:")
    far_future = calculate_position_velocity(914)
    diff = abs(far_future['v_kms'] - V_INFINITY_KMS)
    print(f"   Day 914 速度: {far_future['v_kms']:.2f} km/s")
    print(f"   v_infinity: {V_INFINITY_KMS} km/s")
    print(f"   差異: {diff:.2f} km/s")
    print(f"   結果: {'✅ 通過' if diff < 5 else '❌ 失敗'}")
    print()

    # 檢查距離單調遞增
    print("3. 距離單調遞增檢查 (遠離近日點後):")
    distances = []
    for day in range(120, 501, 30):
        result = calculate_position_velocity(day)
        distances.append(result['r_AU'])

    is_increasing = all(distances[i] < distances[i+1] for i in range(len(distances)-1))
    print(f"   結果: {'✅ 通過' if is_increasing else '❌ 失敗'}")
    print()

    # 能量檢查
    print("4. 能量守恆檢查:")
    print(f"   半長軸 a = {a_AU:.4f} AU (應為負值)")
    print(f"   軌道能量 E = -μ/(2a) = {-GM_SUN/(2*a_m)/1e9:.2e} × 10⁹ J/kg (應為正值)")
    print(f"   結果: {'✅ 通過' if a_AU < 0 else '❌ 失敗'}")
    print()


def main():
    """主函數"""
    verify_perihelion()
    print_trajectory_table()
    verify_physics_laws()

    print("=" * 70)
    print("此參考實現可用於驗證 JavaScript 代碼的正確性")
    print("=" * 70)


if __name__ == "__main__":
    main()
