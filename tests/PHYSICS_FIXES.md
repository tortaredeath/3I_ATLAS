# 3I/ATLAS 物理計算修正文檔

## 發現的問題

### 問題 1: 速度計算錯誤
**症狀**: 所有計算出的速度都是 60 km/s (v_infinity)，無論距離遠近。

**根本原因**:
- 縮放因子 `* 30` 不正確
- vis-viva 方程式的實現需要使用正確的引力常數和距離單位

**正確的物理**:
```
v² = GM☉(2/r - 1/a)
```
其中：
- GM☉ = 1.327×10²⁰ m³/s²
- 對於雙曲線軌道，a < 0
- 在近日點（r = 1.357 AU），速度應該約為 90-100 km/s
- 遠離太陽時，速度趨近於 v∞ = 60 km/s

### 問題 2: 雙曲線異常求解不穩定
**症狀**: 當 day > 300 時，距離計算出現跳躍（46 AU → 3 AU）

**根本原因**:
當平近點角 M > 10 時，使用的近似公式不準確：
```javascript
H = sign(M) * log(2 * |M| / e)  // ❌ 錯誤
```

**解決方案**: 需要更穩定的迭代算法或增加迭代次數。

## 修正建議

### 修正 1: 重新校準速度計算

```javascript
// 原始錯誤代碼
const v_squared = 2 / r - 1 / a;
const v_r = v_squared > 0 ? Math.sqrt(v_squared) * 30 : v_infinity;  // ❌ 縮放因子不對

// 建議修正
function calculateVelocity(r_scene_units, a_scene_units) {
    const AU = 11; // 場景單位中的 1 AU
    const r_AU = r_scene_units / AU;
    const a_AU = a_scene_units / AU;

    // 使用真實物理常數
    const GM_sun = 1.327e20; // m³/s²
    const AU_to_m = 1.496e11; // m

    const r_m = r_AU * AU_to_m;
    const a_m = a_AU * AU_to_m;

    // vis-viva 方程式
    const v_squared = GM_sun * (2/r_m - 1/a_m);
    const v_ms = Math.sqrt(Math.max(0, v_squared));
    const v_kms = v_ms / 1000;

    // 確保不低於 v_infinity
    return Math.max(v_kms, 60);
}
```

### 修正 2: 改進雙曲線異常求解

```javascript
function solveHyperbolicAnomaly(M, e, maxIterations = 20) {
    const tolerance = 1e-8;

    // 更好的初始猜測
    let H;
    if (Math.abs(M) < 1) {
        H = M / (e - 1);
    } else {
        H = Math.sign(M) * Math.log(2 * Math.abs(M) / e + 1.8);
    }

    // Newton-Raphson 迭代
    for (let i = 0; i < maxIterations; i++) {
        const f = e * Math.sinh(H) - H - M;
        if (Math.abs(f) < tolerance) break;

        const df = e * Math.cosh(H) - 1;
        H = H - f / df;

        // 防止發散
        if (Math.abs(H) > 100) {
            console.warn(`H diverging for M=${M}, iteration ${i}`);
            break;
        }
    }

    return H;
}
```

### 修正 3: 限制模擬時間範圍

雙曲線軌道的數值計算在遠離近日點後會變得不穩定。建議：

```javascript
const MAX_SIMULATION_DAYS = 500; // 限制在近日點後約 380 天

if (day > MAX_SIMULATION_DAYS) {
    console.warn('超出穩定計算範圍');
    // 返回外推結果或警告
}
```

## 測試驗證清單

修正後，以下測試應該通過：

- [x] 近日點距離 = 1.357 AU (±0.01)
- [ ] 近日點速度 > 80 km/s （目前錯誤：= 60 km/s）
- [ ] 速度單調遞減（目前失敗）
- [x] 速度趨近 v∞ = 60 km/s
- [ ] 距離單調遞增（目前失敗）
- [x] 能量守恆（a < 0）
- [ ] vis-viva 方程式滿足（目前失敗）

## 實施優先級

1. **高優先**: 修正速度計算（影響用戶體驗）
2. **高優先**: 修正雙曲線異常求解（避免距離跳躍）
3. **中優先**: 添加模擬範圍限制
4. **低優先**: 優化性能和數值穩定性

## 參考資料

- NASA JPL Horizons System: https://ssd.jpl.nasa.gov/horizons/
- Fundamentals of Astrodynamics (Bate, Mueller, White)
- Hyperbolic Kepler Equation: Curtis, "Orbital Mechanics for Engineering Students"
