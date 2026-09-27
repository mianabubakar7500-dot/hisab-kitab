#!/bin/bash
# ==============================================================================
# HISAB KITAB - 1-Click Android APK Build Script
# ==============================================================================
set -e

echo "🚀 [1/3] Building Web Production Assets..."
npm run build

echo "📦 [2/3] Syncing Compiled Web Assets into Android App..."
mkdir -p android/app/src/main/assets
rm -rf android/app/src/main/assets/*
cp -r dist/* android/app/src/main/assets/

echo "🔨 [3/3] Compiling Android Release APK via Gradle..."
cd android
chmod +x gradlew
./gradlew assembleRelease

echo ""
echo "=============================================================================="
echo "✅ SUCCESS! Your Android APK has been built at:"
echo "👉 $(pwd)/app/build/outputs/apk/release/app-release-unsigned.apk"
echo "=============================================================================="
