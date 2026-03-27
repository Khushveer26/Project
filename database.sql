-- =============================================
--  database.sql – Portfolio Database Setup
--  Run this file in MySQL to create the database
--  and the contacts table.
-- =============================================

-- Step 1: Create the database
CREATE DATABASE IF NOT EXISTS portfolio_db;

-- Step 2: Use the database
USE portfolio_db;

-- Step 3: Create the contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id         INT          AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(150) NOT NULL,
    message    TEXT         NOT NULL,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Verify the table was created
DESCRIBE contacts;
