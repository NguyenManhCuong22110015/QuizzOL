import knex from 'knex';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

// Cấu hình chung cho kết nối database
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectTimeout: 10000,
};

// Tạo pool cho mysql2 trước
export const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 5,       // Giảm số lượng kết nối tối đa
  queueLimit: 20,           // Tăng giới hạn queue để xử lý nhiều yêu cầu hơn
  enableKeepAlive: true,    // Giữ kết nối sống
  keepAliveInitialDelay: 10000, // 10 giây
  idleTimeout: 60000        // Đóng kết nối không hoạt động sau 60 giây
});

// Sử dụng mysql2 pool với knex
const db = knex({
  client: 'mysql2',
  connection: dbConfig,
  pool: {
    min: 0,                 // Không giữ kết nối tối thiểu
    max: 3,                 // Giảm số lượng kết nối tối đa
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 30000,
    // Tạo kết nối mới thay vì tái sử dụng
    createTimeoutMillis: 30000,
    // Thời gian để đánh dấu kết nối là free
    destroyTimeoutMillis: 5000,
    // Kiểm tra kết nối trước khi sử dụng
    afterCreate: (conn, done) => {
      conn.query('SELECT 1', (err) => {
        done(err, conn);
      });
    }
  },
});

export default db;