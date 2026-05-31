CREATE DATABASE InventoryManagement;

USE InventoryManagement;

-- =====================================
-- TABLE CREATION
-- =====================================

CREATE TABLE Supplier(
supplier_id INT PRIMARY KEY,
name VARCHAR(50),
phone VARCHAR(15),
address VARCHAR(100)
);

CREATE TABLE Product(
product_id INT PRIMARY KEY,
name VARCHAR(50),
category VARCHAR(50),
price DECIMAL(10,2)
);

CREATE TABLE Purchase(
purchase_id INT PRIMARY KEY,
supplier_id INT,
product_id INT,
quantity INT,
purchase_date DATE,
FOREIGN KEY (supplier_id) REFERENCES Supplier(supplier_id),
FOREIGN KEY (product_id) REFERENCES Product(product_id)
);

CREATE TABLE Sales(
sales_id INT PRIMARY KEY,
product_id INT,
quantity INT,
sales_date DATE,
selling_price DECIMAL(10,2),
FOREIGN KEY (product_id) REFERENCES Product(product_id)
);

CREATE TABLE Warehouse(
warehouse_id INT PRIMARY KEY,
location VARCHAR(100)
);

CREATE TABLE Stock(
stock_id INT PRIMARY KEY,
product_id INT,
warehouse_id INT,
quantity INT,
FOREIGN KEY (product_id) REFERENCES Product(product_id),
FOREIGN KEY (warehouse_id) REFERENCES Warehouse(warehouse_id)
);

-- =====================================
-- SAMPLE DATA INSERTION
-- =====================================

INSERT INTO Supplier VALUES
(1,'Dell','9876543210','Bangalore'),
(2,'HP','9876543211','Mysore'),
(3,'Lenovo','9876543212','Hubli');

INSERT INTO Product VALUES
(101,'Laptop','Electronics',50000),
(102,'Mouse','Accessories',500),
(103,'Keyboard','Accessories',1000),
(104,'Monitor','Electronics',12000);

INSERT INTO Warehouse VALUES
(1,'Bangalore'),
(2,'Mysore'),
(3,'Hubli');

INSERT INTO Purchase VALUES
(1,1,101,50,'2025-05-01'),
(2,2,102,100,'2025-05-03'),
(3,3,104,25,'2025-05-05');

INSERT INTO Sales VALUES
(1,101,5,'2025-05-10',55000),
(2,102,10,'2025-05-11',600),
(3,103,8,'2025-05-12',1200);

INSERT INTO Stock VALUES
(1,101,1,500),
(2,102,1,300),
(3,103,2,400),
(4,104,3,1200);
