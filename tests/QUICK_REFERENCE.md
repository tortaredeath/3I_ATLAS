# 3I/ATLAS 物理參數快速參考

## 🎯 正確的物理數值（2025年最新數據）

### 軌道參數
```
離心率 (e):           6.143 ± 0.0006
近日點距離 (q):       1.357 AU
半長軸 (|a|):         0.2639 AU (負值)
軌道傾角 (i):         175.1°
v_infinity:           60 km/s
近日點日期:           2025-10-29 (Day 120)
```

### 速度演變（關鍵點）
```
Day  90:  67.88 km/s  (接近近日點)
Day 120:  68.33 km/s  ⭐ 近日點最大速度
Day 150:  67.88 km/s  (遠離近日點)
Day 200:  66.03 km/s
Day 300:  63.04 km/s
Day 500:  60.70 km/s
Day 914:  59.35 km/s  (趨近 v_infinity)
```

### 距離演變
```
Day 120:   1.36 AU  ⭐ 近日點最小距離
Day 200:   1.78 AU
Day 300:   2.90 AU
Day 500:   5.49 AU
Day 914:  11.02 AU
```

## 🔴 常見錯誤

### ❌ 錯誤 1: 速度恆定為 60 km/s
```javascript
// 錯誤代碼
const v_r = Math.sqrt(v_squared) * 30;  // ❌ 縮放因子不對
```

**期望**: 近日點應該是 68.33 km/s，不是 60 km/s

### ❌ 錯誤 2: 距離跳躍
```
Day 300: 46.10 AU  ❌ 應該是  2.90 AU
Day 330:  2.74 AU  ❌ 應該是  3.39 AU
```

**原因**: 雙曲線異常求解在大 M 值時不穩定

## ✅ 物理定律檢查表

修改代碼後，確保滿足以下條件：

- [ ] 近日點距離 = 1.357 AU (±0.01)
- [ ] 近日點速度 ≈ 68 km/s (不是 60!)
- [ ] 速度隨距離增加而減小
- [ ] 遠距離速度趨近 60 km/s
- [ ] 距離單調遞增（近日點後）
- [ ] 半長軸 a < 0（雙曲線）
- [ ] 離心率 e = 6.143

## 🚀 快速測試命令

### 運行所有測試
```bash
bash tests/run_all_tests.sh
```

### 只運行參考實現
```bash
python3 tests/correct_physics_reference.py
```

### 只運行 JS 測試
```bash
node tests/orbital_physics_tests.js
```

## 📐 vis-viva 方程式（雙曲線軌道）

```
v² = GM☉(2/r - 1/a)

其中:
- GM☉ = 1.327×10²⁰ m³/s²
- r: 當前距離
- a: 半長軸（雙曲線為負值）
- v∞ = √(GM☉/|a|) ≈ 60 km/s
```

### 實現要點
```javascript
// ✅ 正確的實現
const GM_sun = 1.327e20;  // m³/s²
const AU_to_m = 1.496e11; // m

const r_m = r_AU * AU_to_m;
const a_m = a_AU * AU_to_m;

const v_squared = GM_sun * (2/r_m - 1/a_m);
const v_kms = Math.sqrt(v_squared) / 1000;
```

## 🎓 關鍵物理概念

### 雙曲線軌道特性
1. **離心率 e > 1**: 非封閉軌道
2. **半長軸 a < 0**: 能量為正
3. **v∞**: 逃逸到無限遠的剩餘速度
4. **近日點**: 速度最大的點
5. **不會回歸**: 永遠離開太陽系

### 速度行為
```
           |
   68 km/s |    *              近日點速度最大
           |   / \
   65 km/s |  /   \__          逐漸減慢
   62 km/s | /       \___
   60 km/s |/___________---    趨近 v∞
           |________________
           近日點 →  遠離太陽
```

## 📞 需要幫助？

1. 閱讀 `tests/README.md` - 完整文檔
2. 查看 `tests/PHYSICS_FIXES.md` - 問題診斷
3. 運行 `correct_physics_reference.py` - 獲取正確數值

---

**記住**: 物理是無情的，但測試是你的朋友！ 🧪
