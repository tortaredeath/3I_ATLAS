/**
 * 3I/ATLAS 軌道物理測試套件
 *
 * 此測試套件驗證彗星軌道計算的物理正確性
 * 防止未來出現違反物理定律的程式錯誤
 *
 * 運行方法: node tests/orbital_physics_tests.js
 */

// ==================== 測試框架 ====================
class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(name, fn) {
        this.tests.push({ name, fn });
    }

    assertEqual(actual, expected, tolerance = 0.01, message = '') {
        const diff = Math.abs(actual - expected);
        if (diff > tolerance) {
            throw new Error(
                `${message}\n期望: ${expected.toFixed(4)}, 實際: ${actual.toFixed(4)}, 差異: ${diff.toFixed(4)}`
            );
        }
    }

    assertTrue(condition, message = '') {
        if (!condition) {
            throw new Error(`斷言失敗: ${message}`);
        }
    }

    assertLessThan(actual, max, message = '') {
        if (actual >= max) {
            throw new Error(`${message}\n期望 < ${max}, 實際: ${actual}`);
        }
    }

    assertGreaterThan(actual, min, message = '') {
        if (actual <= min) {
            throw new Error(`${message}\n期望 > ${min}, 實際: ${actual}`);
        }
    }

    async run() {
        console.log('🧪 3I/ATLAS 軌道物理測試套件');
        console.log('='.repeat(60));
        console.log('');

        for (const test of this.tests) {
            try {
                await test.fn();
                console.log(`✅ PASS: ${test.name}`);
                this.passed++;
            } catch (error) {
                console.log(`❌ FAIL: ${test.name}`);
                console.log(`   ${error.message}`);
                console.log('');
                this.failed++;
            }
        }

        console.log('');
        console.log('='.repeat(60));
        console.log(`測試結果: ${this.passed} 通過, ${this.failed} 失敗`);

        if (this.failed > 0) {
            process.exit(1);
        }
    }
}

// ==================== 軌道計算函數 ====================
// 從 index.html 複製的軌道計算邏輯

const ORBITAL_PARAMS = {
    perihelionDay: 120,           // 2025年10月29日
    perihelionDistance: 11 * 1.357, // 1.357 AU in scene units
    eccentricity: 6.143,           // 離心率
    v_infinity: 60,                // km/s 雙曲線超額速度
    inclination: Math.PI * 0.9728, // 175.1°
    ascendingNode: Math.PI * 0.2,
    meanMotion: 0.05
};

function calculateAtlasPosition(day) {
    const { perihelionDay, perihelionDistance, eccentricity, meanMotion, v_infinity } = ORBITAL_PARAMS;

    const daysFromPerihelion = day - perihelionDay;
    const meanAnomaly = meanMotion * daysFromPerihelion;

    // 求解雙曲線異常
    let H = meanAnomaly;
    if (Math.abs(meanAnomaly) < 10) {
        for (let i = 0; i < 5; i++) {
            const sinhH = Math.sinh(H);
            const coshH = Math.cosh(H);
            const f = eccentricity * sinhH - H - meanAnomaly;
            const df = eccentricity * coshH - 1;
            H = H - f / df;
        }
    } else {
        H = Math.sign(meanAnomaly) * Math.log(2 * Math.abs(meanAnomaly) / eccentricity);
    }

    const sinhH = Math.sinh(H);
    const coshH = Math.cosh(H);

    // 雙曲線軌道半長軸（負值）
    const a = -perihelionDistance / (eccentricity - 1);

    // 計算距離
    const r = Math.abs(a) * (eccentricity * coshH - 1);

    // 計算真近點角
    const sinNu = Math.sqrt(eccentricity * eccentricity - 1) * sinhH / (eccentricity * coshH - 1);
    const cosNu = (eccentricity - coshH) / (eccentricity * coshH - 1);
    const nu = Math.atan2(sinNu, cosNu);

    // 計算速度（vis-viva 方程式）
    const v_squared = 2 / r - 1 / a; // a 是負值
    const v_r = v_squared > 0 ? Math.sqrt(v_squared) * 30 : v_infinity;
    const velocity = Math.max(v_r, v_infinity);

    return {
        day,
        distance: r / 11, // AU
        velocity,
        r,
        a,
        H,
        nu
    };
}

// ==================== 測試案例 ====================

const runner = new TestRunner();

// 測試 1: 近日點距離驗證
runner.test('近日點距離應該等於 1.357 AU', () => {
    const result = calculateAtlasPosition(120); // 近日點日期
    runner.assertEqual(
        result.distance,
        1.357,
        0.01,
        '近日點距離不正確'
    );
});

// 測試 2: 離心率驗證（通過軌道參數反推）
runner.test('軌道參數應該滿足雙曲線軌道條件 (e > 1)', () => {
    const { eccentricity } = ORBITAL_PARAMS;
    runner.assertGreaterThan(
        eccentricity,
        1,
        '離心率必須大於 1 才是雙曲線軌道'
    );
    runner.assertEqual(
        eccentricity,
        6.143,
        0.001,
        '離心率應該等於最新觀測值'
    );
});

// 測試 3: 速度在近日點最大
runner.test('速度在近日點應該最大', () => {
    const perihelion = calculateAtlasPosition(120);
    const after30days = calculateAtlasPosition(150);
    const after60days = calculateAtlasPosition(180);
    const after120days = calculateAtlasPosition(240);

    runner.assertGreaterThan(
        perihelion.velocity,
        after30days.velocity,
        '近日點速度應該大於 30 天後'
    );
    runner.assertGreaterThan(
        after30days.velocity,
        after60days.velocity,
        '30 天後速度應該大於 60 天後'
    );
    runner.assertGreaterThan(
        after60days.velocity,
        after120days.velocity,
        '60 天後速度應該大於 120 天後'
    );
});

// 測試 4: 速度單調遞減（遠離近日點後）
runner.test('遠離近日點後，速度應該單調遞減', () => {
    const velocities = [];
    for (let day = 120; day <= 500; day += 30) {
        const result = calculateAtlasPosition(day);
        velocities.push(result.velocity);
    }

    // 檢查是否單調遞減或保持不變（接近 v_infinity）
    for (let i = 1; i < velocities.length; i++) {
        runner.assertTrue(
            velocities[i] <= velocities[i - 1] + 0.1, // 允許微小誤差
            `速度應該遞減: day ${120 + (i-1)*30} = ${velocities[i-1].toFixed(2)}, ` +
            `day ${120 + i*30} = ${velocities[i].toFixed(2)}`
        );
    }
});

// 測試 5: 速度趨近於 v_infinity
runner.test('遠離太陽時，速度應該趨近於 60 km/s (v_infinity)', () => {
    const farFuture = calculateAtlasPosition(914); // 時間軸末端

    // 速度應該接近 v_infinity
    const diff = Math.abs(farFuture.velocity - ORBITAL_PARAMS.v_infinity);
    runner.assertLessThan(
        diff,
        5, // 允許 5 km/s 的誤差
        `遠離太陽時速度應該接近 ${ORBITAL_PARAMS.v_infinity} km/s，實際: ${farFuture.velocity.toFixed(2)} km/s`
    );
});

// 測試 6: 距離單調遞增（遠離近日點後）
runner.test('遠離近日點後，距離應該單調遞增', () => {
    const distances = [];
    for (let day = 120; day <= 500; day += 30) {
        const result = calculateAtlasPosition(day);
        distances.push(result.distance);
    }

    for (let i = 1; i < distances.length; i++) {
        runner.assertGreaterThan(
            distances[i],
            distances[i - 1],
            `距離應該遞增: day ${120 + (i-1)*30} = ${distances[i-1].toFixed(2)} AU, ` +
            `day ${120 + i*30} = ${distances[i].toFixed(2)} AU`
        );
    }
});

// 測試 7: 接近行星的日期和距離
runner.test('火星最接近時間應該在 2025/10/3 附近', () => {
    // 2025/10/3 = 從 2025/7/1 起第 94 天
    const marsApproach = calculateAtlasPosition(94);

    // 火星軌道半徑約 1.5 AU，應該相對較近
    runner.assertLessThan(
        marsApproach.distance,
        3,
        '在火星接近時應該距離太陽較近'
    );
});

// 測試 8: 能量守恆檢查
runner.test('軌道能量應該為正（雙曲線軌道）', () => {
    const { perihelionDistance, eccentricity } = ORBITAL_PARAMS;
    const a = -perihelionDistance / (eccentricity - 1);

    // 對於雙曲線軌道，a < 0，因此軌道能量 E = -μ/(2a) > 0
    runner.assertLessThan(
        a,
        0,
        '雙曲線軌道的半長軸應該為負值'
    );
});

// 測試 9: 速度-距離關係驗證（vis-viva 方程式）
runner.test('速度應該滿足 vis-viva 方程式 v² = μ(2/r - 1/a)', () => {
    const testDays = [120, 150, 200, 300, 500];

    testDays.forEach(day => {
        const result = calculateAtlasPosition(day);
        const { r, a, velocity } = result;

        // vis-viva: v² = 2/r - 1/a (歸一化單位)
        const expected_v_squared = 2 / r - 1 / a;
        const expected_v = Math.sqrt(expected_v_squared) * 30;

        // 檢查計算的速度是否接近理論值（或等於 v_infinity）
        const isCloseToTheory = Math.abs(velocity - expected_v) < 1;
        const isAtVInfinity = Math.abs(velocity - ORBITAL_PARAMS.v_infinity) < 1;

        runner.assertTrue(
            isCloseToTheory || isAtVInfinity,
            `Day ${day}: 速度不符合 vis-viva 方程式。` +
            `實際: ${velocity.toFixed(2)}, 理論: ${expected_v.toFixed(2)}, v∞: ${ORBITAL_PARAMS.v_infinity}`
        );
    });
});

// 測試 10: 近日點之前的軌道對稱性
runner.test('近日點前後的距離應該大致對稱', () => {
    const daysBefore = calculateAtlasPosition(120 - 30); // 近日點前 30 天
    const daysAfter = calculateAtlasPosition(120 + 30);  // 近日點後 30 天

    // 由於雙曲線軌道不完全對稱，允許較大誤差
    const ratio = daysAfter.distance / daysBefore.distance;
    runner.assertTrue(
        ratio > 0.8 && ratio < 1.2,
        `近日點前後 30 天距離比例應該接近 1，實際: ${ratio.toFixed(2)}`
    );
});

// 測試 11: 軌道參數最新數據驗證
runner.test('軌道參數應該匹配 2025 年最新觀測數據', () => {
    const latest = {
        eccentricity: 6.143,
        perihelionDistance: 1.357,
        v_infinity: 60,
        inclination: 175.1
    };

    runner.assertEqual(ORBITAL_PARAMS.eccentricity, latest.eccentricity, 0.001, '離心率');
    runner.assertEqual(ORBITAL_PARAMS.perihelionDistance / 11, latest.perihelionDistance, 0.001, '近日點距離');
    runner.assertEqual(ORBITAL_PARAMS.v_infinity, latest.v_infinity, 0.1, 'v_infinity');

    const inclinationDegrees = ORBITAL_PARAMS.inclination * 180 / Math.PI;
    runner.assertEqual(inclinationDegrees, latest.inclination, 0.1, '軌道傾角');
});

// 測試 12: 物理速度上限檢查
runner.test('速度不應該超過物理合理範圍', () => {
    // 檢查整個時間範圍
    for (let day = 0; day <= 914; day += 50) {
        const result = calculateAtlasPosition(day);

        // 速度應該在合理範圍內（近日點速度應該大於 v_infinity）
        runner.assertLessThan(
            result.velocity,
            200,
            `Day ${day}: 速度過高 ${result.velocity.toFixed(2)} km/s，可能計算錯誤`
        );

        runner.assertGreaterThan(
            result.velocity,
            30,
            `Day ${day}: 速度過低 ${result.velocity.toFixed(2)} km/s，可能計算錯誤`
        );
    }
});

// ==================== 執行所有測試 ====================
runner.run();
