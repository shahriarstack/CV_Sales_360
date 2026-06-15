-- Neon PostgreSQL Setup Script for Sales360 WEBAPP
-- This script creates the tables based on your mock DB structure and inserts the initial data.

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    territories JSONB,
    area_name VARCHAR(255)
);

INSERT INTO users (id, name, role, email, password, territories, area_name) VALUES
('u1', 'System Administrator', 'admin', 'admin@acimotors.com', 'password', '[]', NULL),
('u2', 'Md. Shafiqul (AM)', 'am', 'am@acimotors.com', 'password', '["t1", "t2"]', 'Dhaka Area'),
('u3', 'Rahim Uddin (SO)', 'so', 'so@acimotors.com', 'password', '["t1"]', NULL),
('u4', 'Karim Hasan (SO)', 'so', 'so2@acimotors.com', 'password', '["t2"]', NULL);

-- 2. Territories Table
CREATE TABLE IF NOT EXISTS territories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    upazilas JSONB
);

INSERT INTO territories (id, name, district, upazilas) VALUES
('t1', 'Cox''s Bazar', 'Cox''s Bazar', '[]'),
('t2', 'Narayanganj', 'Narayanganj', '[]'),
('t3', 'Savar', 'Savar', '[]'),
('t4', 'Noakhali', 'Noakhali', '[]'),
('t5', 'Borguna', 'Borguna', '[]'),
('t6', 'Rajshahi', 'Rajshahi', '[]'),
('t7', 'Sylhet', 'Sylhet', '[]'),
('t8', 'Khulna', 'Khulna', '[]'),
('t9', 'Hobiganj', 'Hobiganj', '[]'),
('t10', 'Chattogram North', 'Chattogram North', '[]'),
('t11', 'Narshingdi', 'Narshingdi', '[]'),
('t12', 'B. Baria', 'B. Baria', '[]'),
('t13', 'Thakurgaon', 'Thakurgaon', '[]'),
('t14', 'Feni', 'Feni', '[]'),
('t15', 'Gopalganj', 'Gopalganj', '[]'),
('t16', 'Kishoreganj', 'Kishoreganj', '[]'),
('t17', 'Munshiganj', 'Munshiganj', '[]'),
('t18', 'Rangpur', 'Rangpur', '[]'),
('t19', 'Manikganj', 'Manikganj', '[]'),
('t20', 'Cumilla 1', 'Cumilla 1', '[]'),
('t21', 'Tongi', 'Tongi', '[]'),
('t22', 'Chapainawabgonj', 'Chapainawabgonj', '[]'),
('t23', 'Nilphamari', 'Nilphamari', '[]'),
('t24', 'Sirajganj', 'Sirajganj', '[]'),
('t25', 'Tangail', 'Tangail', '[]'),
('t26', 'Jashore', 'Jashore', '[]'),
('t27', 'Gazipur', 'Gazipur', '[]'),
('t28', 'Mymensingh', 'Mymensingh', '[]'),
('t29', 'Cumilla-2', 'Cumilla-2', '[]'),
('t30', 'Chattogram South', 'Chattogram South', '[]'),
('t31', 'Dinajpur', 'Dinajpur', '[]'),
('t32', 'Dhaka North', 'Dhaka North', '[]'),
('t33', 'Dhaka-3', 'Dhaka-3', '[]'),
('t34', 'Laxmipur', 'Laxmipur', '[]'),
('t35', 'Madaripur', 'Madaripur', '[]'),
('t36', 'Bogura', 'Bogura', '[]'),
('t37', 'Barisal', 'Barisal', '[]'),
('t38', 'Chandpur', 'Chandpur', '[]'),
('t39', 'Jamalpur', 'Jamalpur', '[]'),
('t40', 'Natore', 'Natore', '[]'),
('t41', 'Dhaka South', 'Dhaka South', '[]'),
('t42', 'Jhenaidah', 'Jhenaidah', '[]'),
('t43', 'Kushtia', 'Kushtia', '[]'),
('t44', 'Netrokona', 'Netrokona', '[]');

-- 3. Models Table
CREATE TABLE IF NOT EXISTS models (
    id VARCHAR(50) PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL
);

INSERT INTO models (id, brand, name) VALUES
('m1', 'Foton', 'TM3'),
('m2', 'Foton', 'Auman'),
('m3', 'Foton', 'Tunland'),
('m4', 'Mahindra', 'Bolero'),
('m5', 'Mahindra', 'Supro'),
('m6', 'Mahindra', 'Treo');

-- 4. Targets Table
CREATE TABLE IF NOT EXISTS targets (
    id VARCHAR(50) PRIMARY KEY,
    fy VARCHAR(20) NOT NULL,
    month VARCHAR(20),
    territory_id VARCHAR(50) REFERENCES territories(id),
    upazila VARCHAR(100),
    brand VARCHAR(100),
    sale_type VARCHAR(50),
    target_qty INTEGER
);

INSERT INTO targets (id, fy, month, territory_id, upazila, brand, sale_type, target_qty) VALUES
('tg1', '2025-26', 'April', 't1', 'Mirpur', 'Foton', 'New Sale', 4),
('tg2', '2025-26', 'April', 't1', 'Uttara', 'Foton', 'New Sale', 3),
('tg3', '2025-26', 'April', 't1', 'Savar', 'Foton', 'New Sale', 5),
('tg4', '2025-26', 'April', 't1', 'Mirpur', 'Mahindra', 'New Sale', 2);

-- 5. Notices Table
CREATE TABLE IF NOT EXISTS notices (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    timestamp VARCHAR(50),
    fileType VARCHAR(50),
    fileName VARCHAR(255)
);

INSERT INTO notices (id, title, message, timestamp, fileType, fileName) VALUES
('n1', 'Q2 Performance Target Updates', 'All Area Managers must submit Q2 performance targets by the 25th of this month. Please refer to the attached guideline for instructions.', '14/04/2026', 'pdf', 'Q2_Guidelines.pdf'),
('n2', 'New Sales Scheme: Monsoon Bonus', 'A special bonus scheme for selling Foton TM3 models during this monsoon season. The details of the incentive structure are attached in the image.', '10/04/2026', 'image', 'Monsoon_Offer.jpg');

-- 6. Links Table
CREATE TABLE IF NOT EXISTS links (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255),
    url VARCHAR(255),
    type VARCHAR(50),
    icon VARCHAR(50)
);

INSERT INTO links (id, title, url, type, icon) VALUES
('lnk1', 'ACI Motors Web Portal', 'https://acimotors.com', 'web', 'globe'),
('lnk2', 'Dealer Connect App', '#', 'app', 'smartphone');

-- 7. Projections Table
CREATE TABLE IF NOT EXISTS projections (
    id VARCHAR(50) PRIMARY KEY,
    fy VARCHAR(20),
    month VARCHAR(20),
    territory_id VARCHAR(50) REFERENCES territories(id),
    brand VARCHAR(100),
    sale_type VARCHAR(50),
    projection_qty INTEGER
);

INSERT INTO projections (id, fy, month, territory_id, brand, sale_type, projection_qty) VALUES
('p1', '2025-26', 'April', 't1', 'Foton', 'New Sale', 16),
('p2', '2025-26', 'April', 't1', 'Mahindra', 'New Sale', 4);

-- 8. Sales Table
CREATE TABLE IF NOT EXISTS sales (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50),
    district VARCHAR(100),
    territory_id VARCHAR(50) REFERENCES territories(id),
    upazila VARCHAR(100),
    brand VARCHAR(100),
    model VARCHAR(100),
    unit_qty INTEGER,
    fy VARCHAR(20),
    sales_year INTEGER,
    sales_month VARCHAR(20),
    sale_type VARCHAR(50)
);

INSERT INTO sales (id, customer_id, district, territory_id, upazila, brand, model, unit_qty, fy, sales_year, sales_month, sale_type) VALUES
('s1', 'C-1001', 'Dhaka', 't1', 'Mirpur', 'Foton', 'TM3', 1, '2025-26', 2026, 'April', 'New Sale'),
('s2', 'C-1002', 'Dhaka', 't1', 'Mirpur', 'Foton', 'Auman', 2, '2025-26', 2026, 'April', 'New Sale'),
('s3', 'C-1003', 'Dhaka', 't1', 'Uttara', 'Foton', 'TM3', 1, '2025-26', 2026, 'April', 'Resale'),
('s4', 'C-1004', 'Dhaka', 't1', 'Savar', 'Foton', 'TM3', 3, '2025-26', 2026, 'April', 'New Sale'),
('s5', 'C-1005', 'Dhaka', 't1', 'Mirpur', 'Mahindra', 'Bolero', 2, '2025-26', 2026, 'April', 'New Sale'),
('s6', 'C-1006', 'Dhaka', 't2', 'Motijheel', 'Mahindra', 'Supro', 5, '2025-26', 2026, 'April', 'New Sale'),
('s10', 'C-2001', 'Rajshahi', 't4', 'Rajshahi Sadar', 'Foton', 'TM3', 12, '2025-26', 2026, 'April', 'New Sale'),
('s11', 'C-2002', 'Bogura', 't4', 'Bogura Sadar', 'Mahindra', 'Bolero', 8, '2025-26', 2026, 'April', 'New Sale'),
('s12', 'C-2003', 'Khulna', 't5', 'Khulna Sadar', 'Foton', 'Auman', 5, '2025-26', 2026, 'April', 'New Sale'),
('s13', 'C-2004', 'Jashore', 't5', 'Jashore Sadar', 'Mahindra', 'Treo', 15, '2025-26', 2026, 'April', 'New Sale'),
('s14', 'C-2005', 'Sylhet', 't6', 'Sylhet Sadar', 'Foton', 'TM3', 20, '2025-26', 2026, 'April', 'Resale'),
('s15', 'C-2006', 'Habiganj', 't6', 'Habiganj Sadar', 'Mahindra', 'Supro', 6, '2025-26', 2026, 'April', 'New Sale'),
('s16', 'C-2007', 'Barishal', 't7', 'Barishal Sadar', 'Foton', 'TM3', 9, '2025-26', 2026, 'April', 'New Sale'),
('s17', 'C-2008', 'Rangpur', 't8', 'Rangpur Sadar', 'Mahindra', 'Bolero', 11, '2025-26', 2026, 'April', 'New Sale'),
('s18', 'C-2009', 'Dinajpur', 't8', 'Dinajpur Sadar', 'Foton', 'Tunland', 4, '2025-26', 2026, 'April', 'New Sale'),
('s19', 'C-2010', 'Coxs Bazar', 't3', 'Coxs Bazar', 'Mahindra', 'Bolero', 18, '2025-26', 2026, 'April', 'New Sale'),
('sh1', 'C-H1', 'Dhaka', 't1', 'Mirpur', 'Foton', 'TM3', 4, '2025-26', 2025, 'July', 'New Sale'),
('sh2', 'C-H2', 'Dhaka', 't1', 'Mirpur', 'Foton', 'TM3', 6, '2025-26', 2025, 'August', 'New Sale'),
('sh3', 'C-H3', 'Dhaka', 't1', 'Mirpur', 'Foton', 'TM3', 3, '2025-26', 2025, 'September', 'New Sale'),
('sh4', 'C-H4', 'Dhaka', 't1', 'Mirpur', 'Foton', 'TM3', 8, '2025-26', 2025, 'October', 'New Sale'),
('sh5', 'C-H5', 'Dhaka', 't1', 'Mirpur', 'Foton', 'TM3', 5, '2025-26', 2025, 'November', 'New Sale'),
('sh6', 'C-H6', 'Dhaka', 't1', 'Mirpur', 'Foton', 'TM3', 7, '2025-26', 2025, 'December', 'New Sale'),
('sh7', 'C-H7', 'Dhaka', 't1', 'Mirpur', 'Foton', 'TM3', 4, '2025-26', 2026, 'January', 'New Sale'),
('sh8', 'C-H8', 'Dhaka', 't1', 'Mirpur', 'Foton', 'TM3', 9, '2025-26', 2026, 'February', 'New Sale'),
('sh9', 'C-H9', 'Dhaka', 't1', 'Mirpur', 'Foton', 'TM3', 6, '2025-26', 2026, 'March', 'New Sale'),
('s_ly1', 'C-LY1', 'Dhaka', 't1', 'Mirpur', 'Foton', 'TM3', 45, '2024-25', 2024, 'July', 'New Sale'),
('s_ly2', 'C-LY2', 'Dhaka', 't1', 'Uttara', 'Mahindra', 'Bolero', 30, '2024-25', 2024, 'August', 'New Sale'),
('s_ly3', 'C-LY3', 'Dhaka', 't2', 'Motijheel', 'Foton', 'Auman', 25, '2024-25', 2024, 'September', 'New Sale'),
('s_ly4', 'C-LY4', 'Chattogram', 't3', 'Pahartali', 'Mahindra', 'Supro', 35, '2024-25', 2024, 'October', 'New Sale'),
('s_ly5', 'C-LY5', 'Rajshahi', 't4', 'Rajshahi Sadar', 'Foton', 'TM3', 20, '2024-25', 2024, 'November', 'New Sale'),
('s_ly6', 'C-LY6', 'Khulna', 't5', 'Khulna Sadar', 'Mahindra', 'Treo', 40, '2024-25', 2024, 'December', 'New Sale'),
('s_ly7', 'C-LY7', 'Sylhet', 't6', 'Sylhet Sadar', 'Foton', 'Tunland', 15, '2024-25', 2025, 'January', 'New Sale'),
('s_ly8', 'C-LY8', 'Barishal', 't7', 'Barishal Sadar', 'Mahindra', 'Bolero', 10, '2024-25', 2025, 'February', 'New Sale'),
('s_ly9', 'C-LY9', 'Rangpur', 't8', 'Rangpur Sadar', 'Foton', 'TM3', 22, '2024-25', 2025, 'March', 'New Sale'),
('s_ly10', 'C-LY10', 'Dhaka', 't1', 'Mirpur', 'Foton', 'TM3', 85, '2024-25', 2025, 'April', 'New Sale'),
('s_ly11', 'C-LY11', 'Chattogram', 't3', 'Coxs Bazar', 'Mahindra', 'Bolero', 40, '2024-25', 2025, 'May', 'New Sale'),
('s_ly12', 'C-LY12', 'Rajshahi', 't4', 'Bogura Sadar', 'Foton', 'Auman', 60, '2024-25', 2025, 'June', 'New Sale'),
('s_ly13', 'C-LY13', 'Dhaka', 't1', 'Savar', 'Foton', 'TM3', 15, '2024-25', 2025, 'April', 'Resale');

-- 9. EMI / Collections Table
CREATE TABLE IF NOT EXISTS emi (
    id VARCHAR(50) PRIMARY KEY,
    customer_code VARCHAR(50),
    customer VARCHAR(255),
    phone VARCHAR(50),
    location VARCHAR(255),
    delivery_date DATE,
    first_inst_date DATE,
    overdue_count INTEGER,
    overdue_total DECIMAL(15,2),
    installment DECIMAL(15,2),
    territory_id VARCHAR(50) REFERENCES territories(id),
    collected DECIMAL(15,2),
    brand VARCHAR(100),
    model VARCHAR(100),
    installment_no INTEGER
);

INSERT INTO emi (id, customer_code, customer, phone, location, delivery_date, first_inst_date, overdue_count, overdue_total, installment, territory_id, collected, brand, model, installment_no) VALUES
('e1', 'C-1050', 'M/S Rahman Enterprise', '01711000001', 'Mirpur 10', '2024-01-15', '2024-02-15', 2, 45000, 22500, 't1', 0, 'Foton', 'TM3', 4),
('e2', 'C-1051', 'Jamal Traders', '01711000002', 'Uttara', '2023-11-20', '2023-12-20', 1, 30000, 30000, 't1', 10000, 'Mahindra', 'Bolero', 2),
('e3', 'C-1052', 'Siraj Logistics', '01711000003', 'Gulshan', '2024-03-05', '2024-04-05', 3, 90000, 30000, 't2', 0, 'Foton', 'Auman', 6),
('e4', 'C-1053', 'Bhai Bhai Transport', '01711000004', 'Savar', '2024-04-01', '2024-05-01', 1, 20000, 20000, 't1', 0, 'Foton', 'TM3', 1);

-- 10. Recovery Overdue Summary Table
CREATE TABLE IF NOT EXISTS recovery_od (
    id VARCHAR(50) PRIMARY KEY,
    fy VARCHAR(20),
    month VARCHAR(20),
    territory_id VARCHAR(50) REFERENCES territories(id),
    perfile_od DECIMAL(15,2),
    total_overdue DECIMAL(15,2)
);

INSERT INTO recovery_od (id, fy, month, territory_id, perfile_od, total_overdue) VALUES
('rod1', '2025-26', 'April', 't1', 4500, 1250000),
('rod2', '2025-26', 'April', 't2', 6200, 2100000);

-- 11. TIV Brands
CREATE TABLE IF NOT EXISTS tiv_brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    models JSONB
);

INSERT INTO tiv_brands (name, models) VALUES
('TATA', '["TATA ACE EX2", "TATA intra V20", "TATA 407", "TATA 709 EX CH"]'),
('Ashok Leyland', '["Dost Strong 1 Ton", "Dost Plus 1.2 Ton", "Phoenix 1.2 Ton", "Partner 1.5 Ton", "Partner 3 Ton", "Leo"]'),
('JAC', '["JAC 1.2 Ton", "JAC 1.5 Ton", "JAC 3 Ton"]'),
('Eicher', '["EicherPro 1049 CT", "Eicher 1050", "Eicher 1075"]'),
('Forland', '["Forland 1 Ton", "Forland 1.2 Ton"]'),
('Mahindra', '["Mahindra Bolero 1 Ton", "Mahindra Bolero 1.2 Ton", "Mahindra Load king OPTIMO"]'),
('JMC', '["JMC 1.5 Ton", "JMC 3 Ton"]'),
('SML', '["SML ISUZU 3 Ton"]');

-- 12. TIV Submissions (Empty table for logging submissions)
CREATE TABLE IF NOT EXISTS tiv_submissions (
    id SERIAL PRIMARY KEY,
    submission_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
