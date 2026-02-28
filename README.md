🛁 Sanitary Fittings E-Commerce System

A full-stack Sanitary Fittings E-Commerce Web Application built using Spring Boot (Backend), React.js (Frontend), and MySQL (Database).

This system supports multiple user roles and provides complete product and group management with soft delete, validations, and relationship handling.

📌 Project Overview

The application allows:

Customers to browse products

Admin to manage complete system

Brand Organizer to manage assigned products

The system ensures:

Role-based access

Soft delete functionality

Data validations

Relationship integrity

Secure password storage

🚀 Backend (Spring Boot)
🛠 Technologies Used

Java 17+

Spring Boot

Spring Data JPA

MySQL

Hibernate

BCrypt Password Encoder

REST API Architecture

Maven

🔐 User Roles
1️⃣ CUSTOMER

View products

Browse categories

No admin access

2️⃣ ADMIN

Full system control

Manage users

Manage groups

Manage products

View all customers

Soft delete records

3️⃣ BRAND ORGANIZER

Add products

View products

Delete products

Cannot access customer data

📂 Core Modules
👤 User Management

Register User

Login User

Role-based access

Password hashing using BCrypt

🗂 Group Management

Create group

Update group

Soft delete group

Validation checks

Prevent deletion if linked with products

🛍 Product Management

Add product

Update product

View product list

Delete product (soft delete)

Filter products

Search functionality

Relation with group

🗃 Database Features

Entity relationships (One-to-Many / Many-to-One)

Auto timestamps (Created At / Updated At)

Soft delete using boolean flag

Validation annotations

Proper indexing

🔄 API Features

RESTful APIs

Proper HTTP status codes

Exception handling

Validation error responses

JSON-based communication

💻 Frontend (React.js)
🛠 Technologies Used

React.js

React Router

Axios

Tailwind CSS / CSS

Functional Components

Hooks (useState, useEffect)

Role-based UI rendering

🎨 Features
🔐 Authentication

Login page

Role-based redirection

Form validation

Error handling

🛍 Product Listing

View all products

Filter by group

Search products

Product details page

🛠 Admin Dashboard

Manage users

Manage groups

Manage products

Soft delete handling

Form validations

🏷 Brand Organizer Panel

Add product

Delete product

View assigned products

📱 UI Features

Responsive design

Clean dashboard layout

Sidebar navigation

Role-based menu visibility

Form validation messages

Loading indicators

🔎 Validation Features

Required fields validation

Email format validation

Duplicate record prevention

Backend validation with proper error messages

Frontend input validation

📊 System Highlights

Clean REST architecture

Secure password storage

Role-based system

Soft delete implementation

Modular code design

Scalable structure
