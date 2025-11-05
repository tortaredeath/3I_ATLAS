# 3I/ATLAS 測試套件

本目錄包含 3I/ATLAS 星際彗星軌道模擬器的物理驗證測試。

## 📁 文件說明

### 1. `orbital_physics_tests.js`
**Node.js 測試套件**，驗證軌道計算的物理正確性。

**運行方式**:
```bash
node tests/orbital_physics_tests.js
```

**測試內容**:
- ✅ 近日點距離驗證 (1.357 AU)
- ✅ 離心率驗證 (6.143)
- ⚠️ 速度在近日點最大（目前失敗）
- ✅ 速度單調遞減
- ⚠️ 距離單調遞增（目前失敗）
- ✅ 能量守恆檢查
- ✅ vis-viva 方程式驗證
- ✅ 軌道參數最新數據驗證

### 2. `correct_physics_reference.py`
**Python 參考實現**，提供正確的物理計算作為對照。

**運行方式**:
```bash
python3 tests/correct_physics_reference.py
```

**輸出**:
- 軌道參數摘要
- 完整軌跡數據表（關鍵日期）
- 物理定律驗證結果

**正確的物理數值**:
```
近日點速度: 68.33 km/s (不是 60 km/s!)
Day 914 速度: 59.35 km/s (趨近 v_infinity)
距離範圍: 1.36 AU → 11.02 AU (單調遞增)
```

### 3. `PHYSICS_FIXES.md`
**問題診斷文檔**，詳細說明發現的物理計算錯誤及修正方案。

**主要問題**:
1. **速度計算錯誤**: 縮放因子 `* 30` 不正確
2. **雙曲線異常求解不穩定**: 大 M 值時計算發散

## 🔍 已發現的問題

### 問題 1: 速度恆定為 60 km/s
**症狀**:
- 所有計算出的速度都是 60 km/s
- 近日點速度應該是 **68.33 km/s**

**原因**:
```javascript
// ❌ 錯誤的縮放因子
const v_r = v_squared > 0 ? Math.sqrt(v_squared) * 30 : v_infinity;
```

**期望行為**:
- 近日點 (Day 120): **68.33 km/s**
- Day 200: 66.03 km/s
- Day 400: 61.54 km/s
- Day 914: 59.35 km/s

### 問題 2: 距離計算在 Day 300+ 出現跳躍
**症狀**:
```
Day 300: 46.10 AU  ← 錯誤！
Day 330:  2.74 AU  ← 錯誤！
```

**正確值**:
```
Day 300: 2.90 AU
Day 330: 3.39 AU
```

**原因**: 雙曲線異常求解在 M > 10 時使用的近似公式不準確

## 🎯 使用測試的目的

1. **回歸測試**: 在修改代碼前後運行測試，確保沒有引入新錯誤
2. **物理驗證**: 確保模擬遵守基本物理定律
3. **數據驗證**: 確保使用最新的觀測數據
4. **文檔參考**: Python 參考實現可作為正確計算的示例

## 🔧 如何使用測試驅動修復

### 步驟 1: 運行參考實現
```bash
python3 tests/correct_physics_reference.py > reference_output.txt
```
這會生成正確的數值作為對照。

### 步驟 2: 運行 JavaScript 測試
```bash
node tests/orbital_physics_tests.js
```
查看哪些測試失敗。

### 步驟 3: 修復 index.html 中的計算
根據 `PHYSICS_FIXES.md` 的建議修正代碼。

### 步驟 4: 重新運行測試
確保所有測試通過後再提交。

## 📊 測試覆蓋率

當前測試覆蓋：
- [x] 軌道參數準確性
- [x] 近日點距離
- [ ] 速度計算（部分失敗）
- [x] 速度單調性
- [ ] 距離計算（部分失敗）
- [x] 能量守恆
- [x] vis-viva 方程式
- [ ] 行星接近事件

## 🚀 未來改進

1. **增加視覺化測試**: 生成軌道圖對比
2. **性能測試**: 確保計算效率
3. **邊界條件測試**: 測試極端情況
4. **行星接近精確度**: 驗證接近時間和距離

## 📚 參考資料

- [NASA JPL HORIZONS](https://ssd.jpl.nasa.gov/horizons/)
- [3I/ATLAS Wikipedia](https://en.wikipedia.org/wiki/3I/ATLAS)
- Fundamentals of Astrodynamics (Bate, Mueller, White)
- Orbital Mechanics for Engineering Students (Curtis)

## ⚠️ 重要提示

**在修改 `index.html` 中的軌道計算代碼後，務必運行這些測試！**

這些測試可以：
- 防止物理錯誤
- 確保數據準確性
- 提供可靠的參考實現
- 記錄已知問題和解決方案

---

最後更新: 2025-11-05
