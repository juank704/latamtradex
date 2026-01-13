@echo off
echo Installing Latam Tradex Frontend Dependencies...
echo.

echo Installing axios...
call npm install axios

echo.
echo Dependencies installed successfully!
echo.
echo Next steps:
echo 1. Copy .env.example to .env (already done)
echo 2. Start backend: cd .. ^&^& docker-compose up -d
echo 3. Start frontend: npm run dev
echo.
echo You're all set!
pause
