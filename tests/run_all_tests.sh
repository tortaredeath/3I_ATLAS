#!/bin/bash
# 3I/ATLAS 測試套件執行腳本
# 用途: 運行所有物理驗證測試

set -e  # 遇到錯誤立即退出

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         3I/ATLAS 軌道物理測試套件                              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 檢查依賴
echo "🔍 檢查依賴..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js 未安裝${NC}"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 未安裝${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 所有依賴已滿足${NC}"
echo ""

# 運行 Python 參考實現
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 步驟 1: Python 參考實現（正確的物理計算）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

python3 tests/correct_physics_reference.py

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Python 參考實現執行成功${NC}"
else
    echo ""
    echo -e "${RED}❌ Python 參考實現執行失敗${NC}"
    exit 1
fi

echo ""
echo ""

# 運行 JavaScript 測試
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 步驟 2: JavaScript 測試套件（驗證實際實現）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

node tests/orbital_physics_tests.js

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ 所有 JavaScript 測試通過！${NC}"
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║  🎉 恭喜！所有測試通過，物理計算正確！                        ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    exit 0
else
    echo ""
    echo -e "${YELLOW}⚠️  部分 JavaScript 測試失敗${NC}"
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║  ⚠️  發現物理計算錯誤                                         ║"
    echo "║                                                                ║"
    echo "║  請查看:                                                       ║"
    echo "║  - tests/PHYSICS_FIXES.md  (修正建議)                         ║"
    echo "║  - tests/README.md         (測試文檔)                          ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    exit 1
fi
