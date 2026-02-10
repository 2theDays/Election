@echo off
chcp 65001 >nul
title 2026 충북지사 전략 업데이트 센터

pushd "%~dp0"

echo [관리자] 전략 지휘본부 런처를 실행합니다...
".venv\Scripts\python.exe" commander_launcher.py

if %errorlevel% neq 0 (
    echo.
    echo [오류] 실행 중 에러가 발생했습니다.
    pause
)

popd
