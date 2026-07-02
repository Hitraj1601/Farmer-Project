@echo off
echo Starting Backend and Frontend servers...

cd /d %~dp0Backend
start /b cmd /c "npm run dev"

echo Waiting for backend API on port 5000...
powershell -NoProfile -Command "for ($i = 0; $i -lt 60; $i++) { try { Invoke-WebRequest -UseBasicParsing http://localhost:5000/ | Out-Null; exit 0 } catch { Start-Sleep -Seconds 1 } }; exit 1"

if errorlevel 1 (
	echo Backend did not become ready on port 5000.
	exit /b 1
)

cd /d %~dp0frontend
start /b cmd /c "npm run dev"

echo Both servers are running. Press Ctrl+C to stop.
