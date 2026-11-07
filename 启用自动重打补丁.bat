@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo 启用「合并后自动重放补丁」……
git config core.hooksPath .githooks
if errorlevel 1 (
  echo [错误] 设置失败，确认当前目录是 git 仓库：%CD%
  pause
  exit /b 1
)

echo.
echo 已完成。当前配置：
git config --get core.hooksPath
echo.
echo 之后无论是 git pull、git merge，还是 GitHub 网页同步后本地 pull，
echo 合并结束时都会自动跑 apply-patches.mjs，不需要再手动执行。
echo.
pause
