import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "fenjianlu",
  password: process.env.DB_PASSWORD || "FenjianluDB2026!",
  database: process.env.DB_NAME || "fenjianlu",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;