require("dotenv").config();
const sql = require("mssql");

 let pool;

async function getPool() {
  if (pool) return pool;

    console.log("DB_USER =", process.env.DB_USER);
  console.log("DB_SERVER =", process.env.DB_SERVER);
  console.log("DB_PORT =", process.env.DB_PORT);
  console.log("DB_DATABASE =", process.env.DB_DATABASE);

  pool = await sql.connect({
     user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT, 10),
    database: process.env.DB_DATABASE,
     options: {
      trustServerCertificate: true,
      encrypt: false,
    },
    connectionTimeout: 30000,
    requestTimeout: 30000,
  });

  return pool;
}

module.exports = { getPool };