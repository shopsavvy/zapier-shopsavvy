#!/bin/bash
set -e

echo "🧪 ShopSavvy Zapier Integration Tests"
echo "======================================="

if [ "$1" = "--integration" ]; then
  if [ -z "$SHOPSAVVY_API_KEY" ]; then
    echo "❌ Set SHOPSAVVY_API_KEY env var to run integration tests"
    echo "   Get a key at https://shopsavvy.com/data"
    exit 1
  fi
  echo "Running all tests (live API with real key)..."
  npx jest --testPathPattern='test/' --verbose
else
  echo "Running structural checks (Zapier tests require live API)..."
  echo ""

  echo "Checking required files..."
  REQUIRED="index.js authentication.js lib/api-client.js triggers/price_drop.js triggers/new_deal.js searches/find_product.js searches/get_price_history.js creates/schedule_monitoring.js"
  MISSING=0
  for f in $REQUIRED; do
    if [ ! -f "$f" ]; then
      echo "  ❌ Missing: $f"
      MISSING=$((MISSING + 1))
    fi
  done
  if [ $MISSING -eq 0 ]; then
    echo "  ✅ All required files present ($( echo $REQUIRED | wc -w | tr -d ' ') files)"
  else
    echo "  ❌ $MISSING required files missing"
    exit 1
  fi

  echo "Checking JavaScript syntax..."
  ERRORS=0
  for f in index.js authentication.js lib/api-client.js triggers/*.js searches/*.js creates/*.js; do
    if ! node -c "$f" > /dev/null 2>&1; then
      echo "  ❌ Syntax error: $f"
      ERRORS=$((ERRORS + 1))
    fi
  done
  if [ $ERRORS -eq 0 ]; then
    echo "  ✅ All JS files pass syntax check"
  else
    echo "  ❌ $ERRORS files have syntax errors"
    exit 1
  fi

  echo "Validating app structure..."
  node -e "
    const App = require('./index');
    const checks = [];
    checks.push(['authentication', !!App.authentication]);
    checks.push(['triggers.price_drop', !!App.triggers.price_drop]);
    checks.push(['triggers.new_deal', !!App.triggers.new_deal]);
    checks.push(['searches.find_product', !!App.searches.find_product]);
    checks.push(['searches.get_price_history', !!App.searches.get_price_history]);
    checks.push(['creates.schedule_monitoring', !!App.creates.schedule_monitoring]);
    let failed = false;
    checks.forEach(([name, ok]) => {
      if (!ok) { console.log('  ❌ Missing: ' + name); failed = true; }
    });
    if (!failed) console.log('  ✅ App structure valid (' + checks.length + ' components)');
    else process.exit(1);
  "

  echo ""
  echo "✅ All unit checks passed"
  echo ""
  echo "Note: Zapier's test framework hits the live API."
  echo "Run './test.sh --integration' with SHOPSAVVY_API_KEY to run full tests."
fi
