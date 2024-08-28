# SQL-Schema-Viewer



This project includes scripts for retrieving a list of databases and tables from SQL Server and saving this information to a text file. Additionally, batch files are provided for installing dependencies and running the script.

## Description

### `listDatabasesAndTables.mjs`

This Node.js script performs the following actions:
- Connects to SQL Server using the configuration specified in the script.
- Executes an SQL query to retrieve a list of all databases (excluding system databases) and tables within them.
- Saves the results to a text file named `databases_and_tables.txt`.
- Outputs the information to the console with color formatting.

### `Install.bat`

This script performs:
- Checks for the presence of Node.js and NPM.
- Creates a `package.json` file if it does not exist.
- Installs dependencies using NPM.

### `Start_DB_Clone.bat`

This script runs the main Node.js script `listDatabasesAndTables.mjs`.

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/yourrepository.git
    cd yourrepository
    ```

2. Run `Install.bat` to install all necessary dependencies:

    - On Windows:
      ```bash
      Install.bat
      ```

    - On other operating systems, use the command:
      ```bash
      npm install
      ```

3. Run `Start_DB_Clone.bat` to execute the script and retrieve the list of databases and tables:

    - On Windows:
      ```bash
      Start_DB_Clone.bat
      ```

    - On other operating systems, use the command:
      ```bash
      node listDatabasesAndTables.mjs
      ```

## Requirements

- Node.js installed (version 16 or higher).
- SQL Server installed.
- `mssql` module for Node.js.
- `chalk` module for Node.js.

## Configuration

Update the connection parameters in `listDatabasesAndTables.mjs` according to your SQL Server connection details:

```javascript
import sql from 'mssql';
import fs from 'fs';
import chalk from 'chalk';

// Database connection configuration
const config = {
  user: 'your_username', // Replace with your database username
  password: 'your_password', // Replace with your database password
  server: 'localhost', // Server name
  database: 'master', // Use the master database to run the query
  options: {
    encrypt: true, // Set to true if the server supports encryption
    trustServerCertificate: true // Set to true if you are not using encryption
  }
};
