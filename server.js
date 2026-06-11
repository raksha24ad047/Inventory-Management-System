const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// database credentials connection configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password', // You can change this later to match your computer's password
    database: 'inventory_db',
    port: 3306
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL Database.');
});

// Helper for standard queries
const runQuery = (res, query, params = []) => {
    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// ==========================================
// CORE CRUD ROUTING
// ==========================================

// Get all products (Query 1)
app.get('/api/products', (req, res) => runQuery(res, 'SELECT * FROM Product'));

// Insert a product
app.post('/api/products', (req, res) => {
    const { name, category, price } = req.body;
    runQuery(res, 'INSERT INTO Product (name, category, price) VALUES (?, ?, ?)', [name, category, price]);
});

// Update a product
app.put('/api/products/:id', (req, res) => {
    const { name, category, price } = req.body;
    runQuery(res, 'UPDATE Product SET name=?, category=?, price=? WHERE product_id=?', [name, category, price, req.params.id]);
});

// Delete a product
app.delete('/api/products/:id', (req, res) => runQuery(res, 'DELETE FROM Product WHERE product_id=?', [req.params.id]));

// Get all suppliers
app.get('/api/suppliers', (req, res) => runQuery(res, 'SELECT * FROM Supplier'));

// Insert a purchase (Triggers stock addition)
app.post('/api/purchases', (req, res) => {
    const { supplier_id, product_id, quantity, purchase_date } = req.body;
    runQuery(res, 'INSERT INTO Purchase (supplier_id, product_id, quantity, purchase_date) VALUES (?, ?, ?, ?)', [supplier_id, product_id, quantity, purchase_date]);
});

// Insert a sale (Triggers stock deduction and quantity check validation)
app.post('/api/sales', (req, res) => {
    const { product_id, quantity, sales_date, selling_price } = req.body;
    runQuery(res, 'INSERT INTO Sales (product_id, quantity, sales_date, selling_price) VALUES (?, ?, ?, ?)', [product_id, quantity, sales_date, selling_price]);
});

// ==========================================
// ASSIGNMENT SPECIFIC QUERIES
// ==========================================

// Query 3: 2-Table INNER JOIN
app.get('/api/queries/q3', (req, res) => {
    runQuery(res, `SELECT p.purchase_id, s.name as supplier_name, p.quantity, p.purchase_date FROM Purchase p INNER JOIN Supplier s ON p.supplier_id = s.supplier_id`);
});

// Query 4: 3-Table JOIN
app.get('/api/queries/q4', (req, res) => {
    runQuery(res, `SELECT st.stock_id, p.name as product_name, w.location as warehouse_location, st.quantity FROM Stock st JOIN Product p ON st.product_id = p.product_id JOIN Warehouse w ON st.warehouse_id = w.warehouse_id`);
});

// Query 5: GROUP BY
app.get('/api/queries/q5', (req, res) => {
    runQuery(res, `SELECT warehouse_id, COUNT(product_id) as total_products FROM Stock GROUP BY warehouse_id`);
});

// Query 6: HAVING
app.get('/api/queries/q6', (req, res) => {
    runQuery(res, `SELECT warehouse_id, SUM(quantity) as total_stock FROM Stock GROUP BY warehouse_id HAVING total_stock > 1000`);
});

// Query 7: Subquery
app.get('/api/queries/q7', (req, res) => {
    runQuery(res, `SELECT * FROM Sales WHERE selling_price > (SELECT AVG(selling_price) FROM Sales)`);
});

// Query 9: LEFT JOIN
app.get('/api/queries/q9', (req, res) => {
    runQuery(res, `SELECT p.product_id, p.name, s.sales_id FROM Product p LEFT JOIN Sales s ON p.product_id = s.product_id`);
});

// Query 10: NOT EXISTS
app.get('/api/queries/q10', (req, res) => {
    runQuery(res, `SELECT * FROM Product p WHERE NOT EXISTS (SELECT 1 FROM Sales s WHERE s.product_id = p.product_id)`);
});

// ==========================================
// STORED PROCEDURES CALLS
// ==========================================
app.get('/api/procedures/stock-report', (req, res) => {
    db.query('CALL GetStockReport()', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0]); 
    });
});

app.get('/api/procedures/reorder-check', (req, res) => {
    db.query('CALL CheckReorderRequirement()', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0]);
    });
});

app.listen(5000, () => console.log('Server running on port 5000'));
