
# Blog Application

This project is a blog application that includes user management, secure authentication, and database integration. Below is a detailed guide to set up and use the project.

## Features
- User registration and authentication.
- Secure password hashing using bcrypt.
- Token-based authentication using JWT.
- File upload capabilities using Multer.
- Email functionality with Nodemailer.
- Database integration using MySQL2 and Sequelize.
- Caching support with Redis.

## Prerequisites
Ensure you have the following installed:
- Node.js (>=14.x)
- MySQL (>=8.x)
- Redis (>=6.x)

## Getting Started

### Clone the Repository
```bash
git clone <repository-url>
cd blog
```

### Install Dependencies
```bash
npm install
```

### Set Up Environment Variables
Create a `.env` file in the root directory and configure the following variables:
```env
DB_HOST=your-database-host
DB_USER=your-database-username
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
JWT_SECRET=your-jwt-secret
REDIS_URL=your-link-url-redis-cloud
```

### Configure Database
Use the following SQL script to create the `users` table:
```sql

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE accounts (
    account_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    status ENUM('inactive', 'active') DEFAULT 'inactive',
    is_verified TINYINT(1) DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE
);

CREATE TABLE comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,        
    user_id INT NOT NULL,        
    content TEXT NOT NULL,     
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDAT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES comments(comment_id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE
);


```

### Start the Application
Run the following command to start the application:
```bash
npm start
```
The server will start on the default port (e.g., `http://localhost:3000`).

## Scripts
- **`npm start`**: Starts the server using Nodemon for automatic restarts during development.
- **`npm test`**: Placeholder for tests.

## Dependencies
- `bcrypt`: For hashing passwords.
- `body-parser`: To parse incoming request bodies.
- `dotenv`: To manage environment variables.
- `express`: Web framework for building APIs.
- `jsonwebtoken`: To generate and verify JWTs.
- `multer`: For handling file uploads.
- `mysql2`: MySQL database client.
- `nodemailer`: To send emails.
- `redis`: For caching and session management.
- `sequelize`: ORM for database management.

## Project Structure
```
blog/
├── src/
│   ├── server.js         # Main server file
│   ├── routes/          # API route handlers
│   ├── models/          # Sequelize models
│   ├── controllers/    # Logic for handling requests
│   └── middleware/     # Middleware functions
└── .env                  # Environment variables
```

