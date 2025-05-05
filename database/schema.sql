-- Create database
CREATE DATABASE IF NOT EXISTS codelearn_platform;
USE codelearn_platform;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_enrolled_courses;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS post_tags;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    enrolled_courses INT DEFAULT 0,
    join_date DATE,
    bio TEXT,
    last_login_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    instructor VARCHAR(255) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    level ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    enrolled_students INT DEFAULT 0,
    created_at DATE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    likes INT DEFAULT 0,
    views INT DEFAULT 0,
    created_at DATE,
    updated_at DATE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Post tags table (for many-to-many relationship)
CREATE TABLE IF NOT EXISTS post_tags (
    post_id VARCHAR(36) NOT NULL,
    tag VARCHAR(50) NOT NULL,
    PRIMARY KEY (post_id, tag),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(36) PRIMARY KEY,
    post_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    likes INT DEFAULT 0,
    created_at DATE,
    updated_at DATE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(36) PRIMARY KEY,
    course_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard') NOT NULL,
    question_type ENUM('programming', 'multiple_choice', 'true_false') NOT NULL DEFAULT 'programming',
    code TEXT,
    solution TEXT,
    options JSON,  -- For multiple-choice questions: {"options": ["option1", "option2", ...], "correct_answer": 0}
    correct_answer VARCHAR(255), -- For true/false questions: "true" or "false"
    created_at DATE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- User enrolled courses table (for many-to-many relationship)
CREATE TABLE IF NOT EXISTS user_enrolled_courses (
    user_id VARCHAR(36) NOT NULL,
    course_id VARCHAR(36) NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Insert users data
INSERT INTO users (id, name, email, password, role, last_login_at) VALUES
('3', 'Admin User', 'admin@example.com', 'a44a7285175cd8be374b30ef3702710b:100000:6e374e97d7c1b471d8e1a804a1a838698ffd1ff17acaf9ad56e38da2abdf694e782a4d007eb2e1988eee36db54f5d57dcdd6a0a0b8ffa773c8eb64538169a6ec', 'admin', '2025-04-21 07:24:19'),
('6', '123', '123@123.com', '474a8c3b3391866fd5997beaba15c988:100000:c6c35c6f0b438060fb704ac205f330b5e2517a4df084db9961b19fe6a5b20d07bb41831876fe443499cd72e1d4462db75dffc21b4fca24f8f549ae41338f6ecf', 'user', '2025-04-21 07:38:54');

-- Insert courses data
INSERT INTO courses (id, title, category, description, instructor, duration, level, price, enrolled_students, created_at) VALUES
('1', 'Modern JavaScript Fundamentals', 'frontend', 'Learn the core concepts of modern JavaScript including ES6+ features, promises, async/await, and more.', 'John Smith', '8 weeks', 'beginner', 49.99, 144, '2023-01-15'),
('2', 'Node.js API Development', 'backend', 'Learn how to build RESTful APIs with Node.js, Express, and MongoDB. Includes authentication, validation, and deployment.', 'Michael Brown', '12 weeks', 'intermediate', 69.99, 95, '2023-03-05'),
('3', 'SQL Database Design & Optimization', 'database', 'Master SQL database design, normalization, indexing, and query optimization techniques.', 'Robert Wilson', '8 weeks', 'intermediate', 54.99, 63, '2023-05-15');

-- Insert posts data
INSERT INTO posts (id, user_id, title, content, likes, views, created_at, updated_at) VALUES
('1', '6', 'My Journey Learning JavaScript', 'I''ve been learning JavaScript for the past 3 months and wanted to share my experience. The journey started with basic syntax and has now progressed to building small applications with React. The community here has been incredibly supportive, and the resources provided in the JavaScript fundamentals course have been invaluable. I''m looking forward to diving deeper into advanced concepts and eventually contributing to open-source projects.', 24, 156, '2023-08-15', '2023-08-15'),
('2', '6', 'Tips for Optimizing SQL Queries', 'After completing the SQL Database Design & Optimization course, I wanted to share some practical tips I''ve learned. First, always use indexes for columns frequently used in WHERE clauses. Second, avoid using SELECT * and only retrieve the columns you need. Third, use EXPLAIN to analyze your query execution plan. Fourth, consider denormalizing your schema for read-heavy applications. Finally, use appropriate data types to save storage and improve performance. I''ve applied these principles to a project at work and saw a 40% improvement in query performance!', 42, 231, '2023-09-05', '2023-09-07'),
('3', '6', 'Building My First RESTful API with Node.js', 'I recently completed the Node.js API Development course and built my first RESTful API. The process was challenging but incredibly rewarding. I started by setting up Express and connecting to MongoDB. Then, I implemented user authentication using JWT tokens. The most difficult part was handling error cases and implementing proper validation, but the course materials were extremely helpful. I''ve deployed my API on Heroku and am now working on a frontend to consume it. If anyone has suggestions for frontend frameworks that work well with Node.js APIs, I''d love to hear them!', 18, 97, '2023-10-10', '2023-10-10');

-- Insert post tags data
INSERT INTO post_tags (post_id, tag) VALUES
('1', 'javascript'),
('1', 'beginners'),
('1', 'learning'),
('2', 'sql'),
('2', 'database'),
('2', 'optimization'),
('2', 'performance'),
('3', 'nodejs'),
('3', 'api'),
('3', 'express'),
('3', 'mongodb');

-- Insert comments data
INSERT INTO comments (id, post_id, user_id, content, likes, created_at, updated_at) VALUES
('1', '1', '6', 'Great job on your JavaScript journey! I found that building small projects really helped solidify my understanding. Have you tried working with APIs yet?', 5, '2023-08-16', '2023-08-16'),
('2', '1', '6', 'I''m also learning JavaScript right now. Which resources did you find most helpful for understanding closures and promises?', 3, '2023-08-17', '2023-08-17'),
('3', '2', '6', 'These SQL optimization tips are gold! I implemented your suggestion about indexes and saw immediate performance improvements. Thanks for sharing!', 8, '2023-09-06', '2023-09-06'),
('4', '2', '6', 'Great post! I''d add that using stored procedures can also significantly improve performance for complex operations. Have you experimented with them?', 6, '2023-09-08', '2023-09-08'),
('6', '3', '6', 'I''ve been using Angular with Node.js APIs and it works great. The TypeScript integration is seamless. Would be happy to share some code examples if you''re interested!', 2, '2023-10-12', '2025-04-21');

-- Insert questions data
INSERT INTO questions (id, course_id, title, description, difficulty, question_type, code, solution, created_at) VALUES
('1', '1', 'Create a Hello World Program in JavaScript', 'Write a JavaScript function that prints ''Hello, World!'' to the console.', 'easy', 'programming', 'function helloWorld() {\n  // Your code here\n}', 'function helloWorld() {\n  console.log(''Hello, World!'');\n}', '2023-05-10'),
('2', '1', 'Implement a Debounce Function', 'Create a debounce function that limits the frequency at which a function can be called. It should take a function and a delay time as parameters.', 'medium', 'programming', 'function debounce(func, delay) {\n  // Your code here\n}', 'function debounce(func, delay) {\n  let timeout;\n  return function() {\n    const context = this;\n    const args = arguments;\n    clearTimeout(timeout);\n    timeout = setTimeout(() => func.apply(context, args), delay);\n  };\n}', '2023-05-15'),
('3', '1', 'Implement a Virtual DOM Renderer', 'Create a simplified version of a virtual DOM renderer that can take a virtual DOM object and convert it to actual DOM elements.', 'hard', 'programming', 'function createElement(vnode) {\n  // Your code here\n}', 'function createElement(vnode) {\n  if (typeof vnode === ''string'') {\n    return document.createTextNode(vnode);\n  }\n  \n  const element = document.createElement(vnode.tag);\n  \n  // Set attributes\n  if (vnode.attrs) {\n    Object.keys(vnode.attrs).forEach(key => {\n      element.setAttribute(key, vnode.attrs[key]);\n    });\n  }\n  \n  // Create children\n  if (vnode.children) {\n    vnode.children.forEach(child => {\n      element.appendChild(createElement(child));\n    });\n  }\n  \n  return element;\n}', '2023-05-20'),
('4', '2', 'Create a Simple Express Server', 'Write code to create a basic Express.js server that responds with ''Hello, World!'' on the root route.', 'easy', 'programming', '// Your code here', 'const express = require(''express'');\nconst app = express();\nconst port = 3000;\n\napp.get(''/'', (req, res) => {\n  res.send(''Hello, World!'');\n});\n\napp.listen(port, () => {\n  console.log(`Server running at http://localhost:${port}`);\n});', '2023-06-05');

-- Add multiple choice questions 
INSERT INTO questions (id, course_id, title, description, difficulty, question_type, options, created_at) VALUES
('10', '1', 'JavaScript Data Types', 'Which of the following is NOT a primitive data type in JavaScript?', 'easy', 'multiple_choice', '{"options": ["String", "Number", "Boolean", "Array", "Undefined"], "correct_answer": 3}', '2023-05-25'),
('12', '2', 'Express Middleware', 'What is the correct order of middleware execution in an Express.js application?', 'medium', 'multiple_choice', '{"options": ["Random order", "From top to bottom in the code", "Based on route specificity", "Middleware first, then routes"], "correct_answer": 1}', '2023-06-10'),
('15', '3', 'SQL Joins', 'Which SQL JOIN type returns rows that have matching values in both tables?', 'medium', 'multiple_choice', '{"options": ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL OUTER JOIN"], "correct_answer": 2}', '2023-07-10');

-- Add true/false questions
INSERT INTO questions (id, course_id, title, description, difficulty, question_type, correct_answer, created_at) VALUES
('11', '1', 'JavaScript Hoisting', 'In JavaScript, variable declarations are hoisted to the top of their scope.', 'medium', 'true_false', 'true', '2023-05-30'),
('13', '2', 'Express Routing', 'Express.js supports route parameters using the colon syntax (e.g., /users/:id).', 'easy', 'true_false', 'true', '2023-06-15'),
('16', '3', 'SQL Normalization', 'Third Normal Form (3NF) requires that a table is already in Second Normal Form (2NF).', 'hard', 'true_false', 'true', '2023-07-15'); 