@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

set "NODE="
for /f "delims=" %%I in ('where node 2^>nul') do if not defined NODE set "NODE=%%I"
if not defined NODE if exist "F:\Deepseek\data\dsh-home\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe" set "NODE=F:\Deepseek\data\dsh-home\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe"
if not defined NODE (
  echo [错误] 找不到 node.exe
  pause
  exit /b 1
)

echo 将拉取上游 2026heshao/dsh-armory 并合并，然后重放补丁。
echo 目录: %CD%
echo.

"%NODE%" apply-patches.mjs --sync

echo.
echo 完成。有冲突的话，终端里会打印具体是哪个文件。
pause
