#!/bin/bash

# Test script for CMS Backend - ROVO-81
echo "🚀 Starting CMS Backend Test Suite..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${2}${1}${NC}"
}

# Check if MongoDB is running
check_mongodb() {
    print_status "🔍 Checking MongoDB connection..." $YELLOW
    
    if command -v mongosh >/dev/null 2>&1; then
        mongosh --eval "db.adminCommand('ping')" --quiet >/dev/null 2>&1
    elif command -v mongo >/dev/null 2>&1; then
        mongo --eval "db.adminCommand('ping')" --quiet >/dev/null 2>&1
    else
        print_status "❌ MongoDB client not found. Please install MongoDB." $RED
        exit 1
    fi
    
    if [ $? -eq 0 ]; then
        print_status "✅ MongoDB is running" $GREEN
    else
        print_status "❌ MongoDB is not running. Please start MongoDB first." $RED
        exit 1
    fi
}

# Run acceptance tests based on ROVO-81 criteria
run_acceptance_tests() {
    print_status "📋 Running Acceptance Tests based on ROVO-81 criteria..." $YELLOW
    
    # 驗收條件 1: 數據儲存與讀取測試
    print_status "Testing Criterion 1: Data Storage and Retrieval" $YELLOW
    npm test -- --testNamePattern="數據儲存與讀取測試"
    
    if [ $? -eq 0 ]; then
        print_status "✅ Criterion 1 PASSED: Data can be stored and retrieved correctly" $GREEN
    else
        print_status "❌ Criterion 1 FAILED: Data storage/retrieval issues" $RED
    fi
    
    # 驗收條件 2: 壓力測試  
    print_status "Testing Criterion 2: Load Testing" $YELLOW
    npm test -- --testNamePattern="壓力測試"
    
    if [ $? -eq 0 ]; then
        print_status "✅ Criterion 2 PASSED: API stable under high load" $GREEN
    else
        print_status "❌ Criterion 2 FAILED: Performance issues under load" $RED
    fi
    
    # 驗收條件 3: 用戶測試
    print_status "Testing Criterion 3: User Interface Testing" $YELLOW
    npm test -- --testNamePattern="用戶測試"
    
    if [ $? -eq 0 ]; then
        print_status "✅ Criterion 3 PASSED: Admin interface accessible" $GREEN
    else
        print_status "❌ Criterion 3 FAILED: User interface issues" $RED
    fi
    
    # 驗收條件 4: 安全性測試
    print_status "Testing Criterion 4: Security Testing" $YELLOW
    npm test -- --testNamePattern="安全性測試"
    
    if [ $? -eq 0 ]; then
        print_status "✅ Criterion 4 PASSED: Security standards met" $GREEN
    else
        print_status "❌ Criterion 4 FAILED: Security vulnerabilities found" $RED
    fi
}

# Run all tests
run_all_tests() {
    print_status "🧪 Running All Tests..." $YELLOW
    npm test
    
    if [ $? -eq 0 ]; then
        print_status "✅ All tests passed!" $GREEN
    else
        print_status "❌ Some tests failed. Please check the output above." $RED
    fi
}

# Generate test coverage report
generate_coverage() {
    print_status "📊 Generating Test Coverage Report..." $YELLOW
    npm run test -- --coverage
    
    if [ -d "coverage" ]; then
        print_status "📈 Coverage report generated in ./coverage/lcov-report/index.html" $GREEN
    fi
}

# Main execution
main() {
    print_status "CMS Backend Test Suite - ROVO-81" $GREEN
    print_status "=================================" $GREEN
    
    check_mongodb
    
    case ${1:-all} in
        "acceptance")
            run_acceptance_tests
            ;;
        "coverage")
            generate_coverage
            ;;
        "all"|*)
            run_all_tests
            generate_coverage
            ;;
    esac
    
    print_status "🎉 Test execution completed!" $GREEN
}

# Run main function with all arguments
main "$@"