  import knex from 'knex';
  import dotenv from 'dotenv';
  import mysql from 'mysql2/promise';

  dotenv.config();
  const db = knex({
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      port: process.env.DB_PORT,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    pool: {
      min: 0,           
      max: 4,          
      idleTimeoutMillis: 30000, 
      acquireTimeoutMillis: 30000 
    },
  });


  export const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 3,
    queueLimit: 0,
    connectTimeout: 10000,     
    idleTimeout: 60000 
  });


  export default db;