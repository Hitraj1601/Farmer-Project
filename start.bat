@echo off
echo Starting Backend and Frontend servers...

cd /d %~dp0Backend
start /b cmd /c "npm run dev"

cd /d %~dp0frontend
start /b cmd /c "npm run dev"

echo Both servers are running. Press Ctrl+C to stop.
