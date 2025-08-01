# 📝 ToDoList_DatabaseAPI

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)
![GitHub](https://img.shields.io/badge/license-MIT-green)

A basic To-Do List API that uses PostgreSQL for storage.

## ✨ Features
- **CRUD Operations**: Create, Read, Update, Delete tasks
- **Persistent Storage**: Tasks are stored in a PostgreSQL database
- **Simple UI**: Clean HTML templates with minimal styling and buttons to perform operations
- **Completion Status**: A tasks completion status is stored and displayed

## 🛠️ Project Structure
- `server.js` - Main Express application
- `ToDoList.html` - HTML template with button functionality

## 🚀 Quick Start
### 1. Install PostgreSQL
https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

# 2. Set up Database using PostgreSQL
psql -U postgres  
CREATE DATABASE todolist_api;  
\c todolist_api  
todolist_api=# CREATE TABLE tasks (  
todolist_api(# title VARCHAR(255) NOT NULL,  
todolist_api(# description TEXT,  
todolist_api(# id SERIAL PRIMARY KEY,  
todolist_api(# completed BOOLEAN DEFAULT FALSE  
todolist_api(# );  
CREATE TABLE  

# 3. Initialize Project in Project Directory
npm init -y

# 4. Install Express & CORS
npm install express  
npm install cors

# 5. Download Code
Download and place both `server.js` and `ToDoList.html` inside project directory  
Replace PostgreSQL server connection information in `server.js`

# 6. Launch Node.js/Express Server
IDE (Visual Studio)  
- run `server.js`  

Command Line  
- node `server.js`  

# 7. Access Application via Web Browser
Open `ToDoList.html` file  

## 🛠️ Usage Guide

### Getting Task
1. Click "Get Tasks" to access the entire list of tasks
2. Click "Get Task by ID" and enter a Task ID to access a specific task

### Adding Task
1. Click "Add Task" and enter a Task Name
2. The Task ID will be automatically generated to the next highest available ID
3. The Completion Status will default to Incomplete '❌'

### Updating a Task
1. Click "Update Task" and enter a Task ID
2. Update Task name when prompted or leave unchanged
3. Update Completion Status when prompted or leave unchanged

### Deleting a Task
1. Click "Delete Task" and enter a Task ID
