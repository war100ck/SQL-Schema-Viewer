@echo off
echo Installing Node.js dependencies...
echo -----------------------------------

:: Проверка наличия Node.js и NPM
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js is not installed. Please install Node.js from https://nodejs.org/ before running this script.
    pause
    exit /b 1
)

where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo NPM is not installed. Please install Node.js which includes NPM from https://nodejs.org/.
    pause
    exit /b 1
)

:: Создание файла package.json если его нет
if not exist package.json (
    echo Creating package.json file...
    (
        echo { 
        echo   "type": "module",
        echo   "dependencies": {
        echo     "chalk": "^5.3.0",
        echo     "mssql": "^11.0.1"
        echo   }
        echo }
    ) > package.json
)

:: Установка зависимостей с прогресс-баром
echo Installing dependencies, please wait...
npm install

:: Проверка успешности установки
if %ERRORLEVEL% neq 0 (
    echo Installation failed. Please check the error messages above.
    pause
    exit /b 1
)

:: Удержание окна открытым
echo -----------------------------------
echo Installation complete. Press any key to exit...
pause
