# Dự án Node.js MVC với Handlebars

Ứng dụng web sử dụng kiến trúc MVC với Node.js, Express và Handlebars. Dữ liệu được kết nối qua MySQL.

## Yêu cầu

- Node.js
- MySQL

## Cài đặt

### 1. Clone project
git clone ...


### 2. Cài dependencies
npm install

### 3. Cấu hình biến môi trường
Tạo file `.env` từ file mẫu:  
cp .env.example .env  
Sau đó chỉnh sửa thông tin kết nối CSDL trong `.env`:

DB_HOST=localhost  
DB_USER=root  
DB_PASSWORD=yourpassword  
DB_NAME=yourdbname  
DB_PORT=3306

### 4. Tạo database và bảng
Chạy script tạo CSDL tự động:  
node db.js
or run script in MySQL WorkBench

### 5. Chạy ứng dụng
npm start  
Truy cập tại: http://localhost:3000

## Cấu trúc thư mục

project-root/  
├── authentication/
├── configs/
├── controllers/  
├── middlewares/     # Chứa các controller xử lý logic  
├── routes/
├── services/            # Chứa các model truy vấn CSDL  
├── views/             # Template handlebars (file .hbs)  
├── public/            # File tĩnh (CSS, JS, ảnh)  
├── db.js              # Script tạo CSDL và bảng  
├── app.js             # Điểm khởi đầu ứng dụng  
├── .env               # File cấu hình môi trường (KHÔNG commit lên git)  
├── .env.example       # Mẫu cấu hình môi trường cho người mới  
├── package.json       # Thông tin project & dependencies  

## License
MIT
