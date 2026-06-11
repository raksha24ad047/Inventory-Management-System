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
// 1. IMPROVED REPORT (Displays directly on page)
function generateStockReport() {
    const container = document.getElementById('reportContainer');
    let reportHTML = "<ul>";
    db.stocks.forEach(s => {
        // Here we link Product ID to its Name
        let product = db.products.find(p => p.id === s.id) || {name: "Unknown Product"};
        reportHTML += `<li>${product.name} (ID: ${s.id}) - Current Stock: ${s.qty}</li>`;
    });
    reportHTML += "</ul>";
    container.innerHTML = reportHTML;
}

// 2. TRIGGER (Display in a UI toast/banner instead of alert)
function checkReorderTrigger(stock) {
    if (stock.qty < 10) {
        const notify = document.getElementById('notificationArea');
        notify.innerHTML = `<p style="color:red; font-weight:bold;">⚠️ Alert: Stock for ${stock.id} is low!</p>`;
    }
}

// 3. UPDATE FUNCTION
function editProduct(index) {
    document.getElementById('updateForm').style.display = 'block';
    document.getElementById('editIndex').value = index;
    document.getElementById('editName').value = db.products[index].name;
}

function saveUpdate() {
    const index = document.getElementById('editIndex').value;
    db.products[index].name = document.getElementById('editName').value;
    document.getElementById('updateForm').style.display = 'none';
    save(); // Save to local storage
    render(); // Refresh table
}
function render() {
    const tbody = document.getElementById('pBody');
    tbody.innerHTML = db.products.map((p, i) => `<tr><td>${p.name}</td><td>${p.price}</td><td><button onclick="deleteProduct(${i})">Delete</button></td></tr>`).join('');
}

function deleteProduct(i) { db.products.splice(i, 1); save(); }

render();
