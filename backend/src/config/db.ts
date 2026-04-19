import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "12340",
  database: "sistemaapae",
  waitForConnections: true,
  connectionLimit: 10,
});