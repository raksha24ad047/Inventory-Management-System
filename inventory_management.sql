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



-- =====================================
-- QUERY 1
-- Retrieve all products
-- =====================================

SELECT * FROM Product;

-- =====================================
-- QUERY 2
-- Products supplied by a specific supplier
-- =====================================

SELECT P.*
FROM Product P
JOIN Purchase PU
ON P.product_id = PU.product_id
WHERE PU.supplier_id = 1;

-- =====================================
-- QUERY 3
-- Product and supplier details
-- =====================================

SELECT P.product_id,
P.name AS Product_Name,
S.name AS Supplier_Name
FROM Product P
INNER JOIN Purchase PU
ON P.product_id = PU.product_id
INNER JOIN Supplier S
ON PU.supplier_id = S.supplier_id;

-- =====================================
-- QUERY 4
-- Product, supplier and warehouse details
-- =====================================

SELECT P.name AS Product_Name,
S.name AS Supplier_Name,
W.location AS Warehouse
FROM Product P
JOIN Purchase PU
ON P.product_id = PU.product_id
JOIN Supplier S
ON PU.supplier_id = S.supplier_id
JOIN Stock ST
ON P.product_id = ST.product_id
JOIN Warehouse W
ON ST.warehouse_id = W.warehouse_id;

-- =====================================
-- QUERY 5
-- Count products in each warehouse
-- =====================================

SELECT warehouse_id,
COUNT(product_id) AS Total_Products
FROM Stock
GROUP BY warehouse_id;

-- =====================================
-- QUERY 6
-- Warehouses with stock > 1000
-- =====================================

SELECT warehouse_id,
SUM(quantity) AS Total_Stock
FROM Stock
GROUP BY warehouse_id
HAVING SUM(quantity) > 1000;

-- =====================================
-- QUERY 7
-- Products priced above average
-- =====================================

SELECT *
FROM Product
WHERE price >
(
SELECT AVG(price)
FROM Product
);

-- =====================================
-- QUERY 8
-- Highest priced product in each category
-- =====================================

SELECT *
FROM Product P1
WHERE price =
(
SELECT MAX(price)
FROM Product P2
WHERE P1.category = P2.category
);

-- =====================================
-- QUERY 9
-- LEFT JOIN
-- =====================================

SELECT P.product_id,
P.name,
S.sales_id,
S.quantity
FROM Product P
LEFT JOIN Sales S
ON P.product_id = S.product_id;

-- =====================================
-- QUERY 10
-- Products never sold
-- =====================================

SELECT *
FROM Product P
WHERE NOT EXISTS
(
SELECT *
FROM Sales S
WHERE S.product_id = P.product_id
);

-- =====================================
-- STORED PROCEDURE 1
-- Get Product Details
-- =====================================

DELIMITER //

CREATE PROCEDURE GetProductDetails(IN pid INT)
BEGIN
SELECT *
FROM Product
WHERE product_id = pid;
END //

DELIMITER ;

-- Execute
CALL GetProductDetails(101);

-- =====================================
-- STORED PROCEDURE 2
-- Get Product Stock
-- =====================================

DELIMITER //

CREATE PROCEDURE GetProductStock(IN pid INT)
BEGIN
SELECT P.name,
SUM(S.quantity) AS Total_Stock
FROM Product P
JOIN Stock S
ON P.product_id = S.product_id
WHERE P.product_id = pid
GROUP BY P.name;
END //

DELIMITER ;

-- Execute
CALL GetProductStock(101);

-- =====================================
-- TRIGGER 1
-- Reduce Stock After Sale
-- =====================================

DELIMITER //

CREATE TRIGGER ReduceStockAfterSale
AFTER INSERT ON Sales
FOR EACH ROW
BEGIN
UPDATE Stock
SET quantity = quantity - NEW.quantity
WHERE product_id = NEW.product_id;
END //

DELIMITER ;

-- =====================================
-- TRIGGER 2
-- Prevent Negative Stock
-- =====================================

DELIMITER //

CREATE TRIGGER CheckStockBeforeSale
BEFORE INSERT ON Sales
FOR EACH ROW
BEGIN
DECLARE available_stock INT;

```
SELECT quantity
INTO available_stock
FROM Stock
WHERE product_id = NEW.product_id
LIMIT 1;

IF NEW.quantity > available_stock THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Insufficient Stock';
END IF;
```

END //

DELIMITER ;
