// --- DATABASE SIMULATION ---
let db = JSON.parse(localStorage.getItem('db')) || { products: [], stocks: [] };

function save() { localStorage.setItem('db', JSON.stringify(db)); render(); }

// --- "STORED PROCEDURE" (Logic for reports) ---
function generateStockReport() {
    let report = db.stocks.map(s => `Product ID: ${s.id}, Qty: ${s.qty}`).join('\n');
    alert("--- Stock Report ---\n" + (report || "No Data"));
}

// --- "TRIGGER" (Simulating logic after insertion) ---
function checkReorderTrigger(stock) {
    if (stock.qty < 10) {
        alert("TRIGGER ALERT: Stock for Product " + stock.id + " is low! Reorder required.");
    }
}

// --- CRUD OPERATIONS ---
function addProduct() {
    db.products.push({ name: document.getElementById('pName').value, price: document.getElementById('pPrice').value });
    save();
}

function addStock() {
    let newStock = { id: Date.now(), qty: parseInt(document.getElementById('sQty').value) };
    db.stocks.push(newStock);
    
    // Trigger fires here
    checkReorderTrigger(newStock);
    
    save();
}

function render() {
    const tbody = document.getElementById('pBody');
    tbody.innerHTML = db.products.map((p, i) => `<tr><td>${p.name}</td><td>${p.price}</td><td><button onclick="deleteProduct(${i})">Delete</button></td></tr>`).join('');
}

function deleteProduct(i) { db.products.splice(i, 1); save(); }

render();
