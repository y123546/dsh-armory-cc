@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

rem 找到 node：优先 PATH，其次用 DSH 自带的运行时
set "NODE="
for /f "delims=" %%I in ('where node 2^>nul') do if not defined NODE set "NODE=%%I"
if not defined NODE if exist "F:\Deepseek\data\dsh-home\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe" set "NODE=F:\Deepseek\data\dsh-home\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe"
if not defined NODE (
  echo [错误] 找不到 node.exe
  echo 请安装 node，或手动改本脚本里的 NODE 路径。
  pause
  exit /b 1
)

echo 目录: %CD%
echo Node: %NODE%
echo.

"%NODE%" apply-patches.mjs %*

echo.
echo 完成后记得提交: git add -A ^&^& git commit -m "reapply patches" ^&^& git push
pause
