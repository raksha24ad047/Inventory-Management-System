-- 1. Supplier Table
CREATE TABLE Supplier (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT
);

-- 2. Product Table
CREATE TABLE Product (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    price DECIMAL(10,2) NOT NULL
);

-- 3. Warehouse Table
CREATE TABLE Warehouse (
    warehouse_id INT AUTO_INCREMENT PRIMARY KEY,
    location VARCHAR(100) NOT NULL
);

-- 4. Stock Table
CREATE TABLE Stock (
    stock_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    warehouse_id INT,
    quantity INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES Product(product_id) ON DELETE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES Warehouse(warehouse_id) ON DELETE CASCADE
);

-- 5. Purchase Table
CREATE TABLE Purchase (
    purchase_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT,
    product_id INT,
    quantity INT NOT NULL,
    purchase_date DATE NOT NULL,
    FOREIGN KEY (supplier_id) REFERENCES Supplier(supplier_id) ON DELETE SET NULL,
    FOREIGN KEY (product_id) REFERENCES Product(product_id) ON DELETE CASCADE
);

-- 6. Sales Table
CREATE TABLE Sales (
    sales_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    quantity INT NOT NULL,
    sales_date DATE NOT NULL,
    selling_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES Product(product_id) ON DELETE CASCADE
);

-- ==========================================
-- STORED PROCEDURES
-- ==========================================

DELIMITER $$

-- 1. Generate Stock Report
CREATE PROCEDURE GetStockReport()
BEGIN
    SELECT 
        p.product_id, 
        p.name AS product_name, 
        p.category,
        w.location AS warehouse_location, 
        s.quantity AS current_stock
    FROM Stock s
    JOIN Product p ON s.product_id = p.product_id
    JOIN Warehouse w ON s.warehouse_id = w.warehouse_id;
END$$

-- 2. Check Reorder Requirement
CREATE PROCEDURE CheckReorderRequirement()
BEGIN
    SELECT 
        p.product_id, 
        p.name AS product_name, 
        SUM(s.quantity) AS total_stock,
        CASE 
            WHEN SUM(s.quantity) < 10 THEN 'REORDER IMMEDIATE'
            ELSE 'Stock Adequate'
        END AS status
    FROM Product p
    LEFT JOIN Stock s ON p.product_id = s.product_id
    GROUP BY p.product_id, p.name
    HAVING total_stock < 10 OR total_stock IS NULL;
END$$

DELIMITER ;

-- ==========================================
-- TRIGGERS
-- ==========================================

DELIMITER $$

-- 1. Update stock after purchase insertion
CREATE TRIGGER AfterPurchaseInsert
AFTER INSERT ON Purchase
FOR EACH ROW
BEGIN
    DECLARE warehouse_count INT;
    DECLARE def_warehouse_id INT;
    
    SELECT warehouse_id INTO def_warehouse_id FROM Warehouse LIMIT 1;
    
    IF def_warehouse_id IS NULL THEN
        INSERT INTO Warehouse (location) VALUES ('Default Main Warehouse');
        SET def_warehouse_id = LAST_INSERT_ID();
    END IF;

    SELECT COUNT(*) INTO warehouse_count FROM Stock WHERE product_id = NEW.product_id AND warehouse_id = def_warehouse_id;
    
    IF warehouse_count > 0 THEN
        UPDATE Stock 
        SET quantity = quantity + NEW.quantity 
        WHERE product_id = NEW.product_id AND warehouse_id = def_warehouse_id;
    ELSE
        INSERT INTO Stock (product_id, warehouse_id, quantity) VALUES (NEW.product_id, def_warehouse_id, NEW.quantity);
    END IF;
END$$

-- 2. Prevent sale if stock is insufficient
CREATE TRIGGER BeforeSalesInsert
BEFORE INSERT ON Sales
FOR EACH ROW
BEGIN
    DECLARE total_available INT;
    
    SELECT COALESCE(SUM(quantity), 0) INTO total_available 
    FROM Stock 
    WHERE product_id = NEW.product_id;
    
    IF total_available < NEW.quantity THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Transaction Aborted: Insufficient stock for this product.';
    ELSE
        UPDATE Stock 
        SET quantity = quantity - NEW.quantity
        WHERE product_id = NEW.product_id AND quantity >= NEW.quantity
        LIMIT 1;
    END IF;
END$$

DELIMITER ;

-- Dummy data for testing
INSERT INTO Supplier (name, phone, address) VALUES ('Global Tech Corp', '1234567890', '123 Silicon Valley'), ('Alpha Logistics', '9876543210', '456 Freight Ave');
INSERT INTO Product (name, category, price) VALUES ('Wireless Mouse', 'Electronics', 25.00), ('Mechanical Keyboard', 'Electronics', 75.00), ('Desk Mat', 'Office Supplies', 15.00);
INSERT INTO Warehouse (location) VALUES ('Chicago Hub'), ('New York Facility');
INSERT INTO Stock (product_id, warehouse_id, quantity) VALUES (1, 1, 50), (2, 1, 5), (3, 2, 100);
