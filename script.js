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
   const qty = parseInt(document.getElementById('sQty').value);
    const pName = document.getElementById('pName').value; // Ensure you have this input
    
    // 1. Add to database
    db.stocks.push({ name: pName, qty: qty });
    save();
    
    // 2. Fire the Trigger
    checkReorderTrigger(qty, pName);
    
    // 3. Refresh display
    render();
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
    const notify = document.getElementById('notificationArea');
    
    // The "Trigger" condition
    if (qty < 10) {
        // Update the dashboard UI instead of using alert()
        notify.innerHTML = `
            <div style="background-color: #ffe6e6; border: 1px solid red; padding: 10px; margin: 10px 0; border-radius: 5px;">
                <strong>⚠️ REORDER TRIGGER:</strong> Stock for "${productName}" is low (${qty} units). Please reorder!
            </div>`;
    } else {
        // Clear the alert if stock is sufficient
        notify.innerHTML = ''; 
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
