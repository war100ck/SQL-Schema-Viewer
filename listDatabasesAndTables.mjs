import sql from 'mssql';
import fs from 'fs';
import chalk from 'chalk';

// Конфигурация подключения к базе данных
const config = {
  user: 'your_username', // Имя пользователя
  password: 'your_password', // Пароль
  server: 'localhost', // Имя сервера
  database: 'master', // Используем базу данных master для выполнения запроса
  options: {
    encrypt: true, // Используйте true, если сервер поддерживает шифрование
    trustServerCertificate: true // Используйте true, если вы не используете шифрование
  }
};

async function getDatabasesAndTables() {
  const outputFile = 'databases_and_tables.txt'; // Название файла для записи
  let outputData = ''; // Переменная для хранения текста для файла
  let consoleOutput = ''; // Переменная для хранения текста для консоли

  let totalDatabases = 0; // Счётчик баз данных
  let totalTables = 0; // Счётчик таблиц

  try {
    // Создаем соединение с SQL Server
    let pool = await sql.connect(config);

    // SQL запрос для получения баз данных и таблиц
    const query = `
      DECLARE @db_name NVARCHAR(128);
      DECLARE @sql NVARCHAR(MAX);

      -- Создаем таблицу для хранения результатов
      CREATE TABLE #TablesInfo (
          DatabaseName NVARCHAR(128),
          TableName NVARCHAR(128)
      );

      -- Получаем список баз данных
      DECLARE db_cursor CURSOR FOR
      SELECT name 
      FROM sys.databases
      WHERE name NOT IN ('master', 'tempdb', 'model', 'msdb'); -- Исключаем системные базы данных

      OPEN db_cursor;
      FETCH NEXT FROM db_cursor INTO @db_name;

      WHILE @@FETCH_STATUS = 0
      BEGIN
          -- Создаем динамический SQL для получения списка таблиц в текущей базе данных
          SET @sql = 'USE [' + @db_name + ']; INSERT INTO #TablesInfo (DatabaseName, TableName) ' +
                     'SELECT ''' + @db_name + ''', TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = ''BASE TABLE'';';
          
          EXEC sp_executesql @sql;
          
          FETCH NEXT FROM db_cursor INTO @db_name;
      END

      CLOSE db_cursor;
      DEALLOCATE db_cursor;

      -- Выводим результаты
      SELECT * FROM #TablesInfo;

      -- Удаляем временную таблицу
      DROP TABLE #TablesInfo;
    `;

    // Выполняем запрос
    const result = await pool.request().query(query);

    let currentDatabase = '';
    let tables = [];
    
    result.recordset.forEach(row => {
      if (row.DatabaseName !== currentDatabase) {
        // Если есть данные о предыдущей базе данных, добавляем их в вывод
        if (currentDatabase !== '') {
          // Для текстового файла
          outputData += `Database: ${currentDatabase}\n`;
          tables.forEach(table => {
            outputData += `  Table: ${table}\n`;
          });
          outputData += `Tables for "${currentDatabase}" - Received\n`;
          outputData += `Total tables - ${tables.length}\n`;
          outputData += '-----------------------------------------\n\n';

          // Для консоли
          consoleOutput += `${chalk.cyan.bold(`Database: ${currentDatabase}`)}\n`;
          tables.forEach(table => {
            consoleOutput += `  ${chalk.yellow('Table:')} ${table}\n`;
          });
          consoleOutput += `${chalk.green.bold(`Tables for "${currentDatabase}" - Received`)}\n`;
          consoleOutput += `${chalk.blue(`Total tables - ${tables.length}`)}\n`;
          consoleOutput += `${chalk.gray('-----------------------------------------')}\n\n`;
          
          // Обновляем счетчики
          totalDatabases++;
          totalTables += tables.length;
          
          // Очищаем массив таблиц для новой базы данных
          tables = [];
        }

        // Обновляем текущую базу данных
        currentDatabase = row.DatabaseName;
      }
      
      // Добавляем таблицу в массив
      tables.push(row.TableName);
    });

    // Добавляем информацию о последней базе данных
    if (currentDatabase !== '') {
      // Для текстового файла
      outputData += `Database: ${currentDatabase}\n`;
      tables.forEach(table => {
        outputData += `  Table: ${table}\n`;
      });
      outputData += `Tables for "${currentDatabase}" - Received\n`;
      outputData += `Total tables - ${tables.length}\n`;
      outputData += '-----------------------------------------\n';

      // Для консоли
      consoleOutput += `${chalk.cyan.bold(`Database: ${currentDatabase}`)}\n`;
      tables.forEach(table => {
        consoleOutput += `  ${chalk.yellow('Table:')} ${table}\n`;
      });
      consoleOutput += `${chalk.green.bold(`Tables for "${currentDatabase}" - Received`)}\n`;
      consoleOutput += `${chalk.blue(`Total tables - ${tables.length}`)}\n`;
      consoleOutput += `${chalk.gray('-----------------------------------------')}\n`;

      // Обновляем счетчики
      totalDatabases++;
      totalTables += tables.length;
    }

    // Записываем в файл
    outputData += `Total databases - ${totalDatabases}\n`;
    outputData += `Total tables - ${totalTables}\n`;
    fs.writeFileSync(outputFile, outputData.trim(), 'utf8');

    // Выводим информацию в консоль
    consoleOutput += `${chalk.magenta.bold(`Total databases - ${totalDatabases}`)}\n`;
    consoleOutput += `${chalk.magenta.bold(`Total tables - ${totalTables}`)}\n`;
    console.log(consoleOutput);

  } catch (err) {
    console.error('Ошибка:', err);
  } finally {
    // Закрываем соединение
    await sql.close();
  }
}

// Выполняем функцию
getDatabasesAndTables();
