// --- DATABASE SIMULATION ---
let db = JSON.parse(localStorage.getItem('db')) || { products: [], stocks: [] };

function save() { 
    localStorage.setItem('db', JSON.stringify(db)); 
    render(); 
}

// --- "STORED PROCEDURE" (Generates Report on page) ---
function generateStockReport() {
    const container = document.getElementById('reportContainer');
    if (!container) return;
    
    let reportHTML = "<ul>";
    db.stocks.forEach(s => {
        reportHTML += `<li>Product: ${s.name} - Current Stock: ${s.qty}</li>`;
    });
    reportHTML += "</ul>";
    container.innerHTML = reportHTML;
}

// --- "TRIGGER" (Checks low stock) ---
function checkReorderTrigger(qty, name) {
    const notify = document.getElementById('notificationArea');
    if (!notify) return;
    
    if (qty < 10) {
        notify.innerHTML = `
            <div style="background-color: #ffe6e6; border: 1px solid red; padding: 10px; margin: 10px 0; border-radius: 5px;">
                <strong>⚠️ REORDER TRIGGER:</strong> Stock for "${name}" is low (${qty} units). Please reorder!
            </div>`;
    } else {
        notify.innerHTML = ''; 
    }
}

// --- CRUD OPERATIONS ---
function addProduct() {
    const name = document.getElementById('pName').value;
    const price = document.getElementById('pPrice').value;
    if(name && price) {
        db.products.push({ name, price });
        save();
    }
}

function addStock() {
    const qty = parseInt(document.getElementById('sQty').value);
    const pName = document.getElementById('pName').value;
    
    if(pName && !isNaN(qty)) {
        // Add to database
        db.stocks.push({ name: pName, qty: qty });
        save();
        
        // Fire Trigger
        checkReorderTrigger(qty, pName);
    }
}

function render() {
    const tbody = document.getElementById('pBody');
    if(tbody) {
        tbody.innerHTML = db.products.map((p, i) => `
            <tr>
                <td>${p.name}</td>
                <td>${p.price}</td>
                <td>
                    <button onclick="editProduct(${i})">Edit</button>
                    <button onclick="deleteProduct(${i})">Delete</button>
                </td>
            </tr>`).join('');
    }
}

function deleteProduct(i) { db.products.splice(i, 1); save(); }

// --- UPDATE FUNCTIONS ---
function editProduct(index) {
    document.getElementById('updateForm').style.display = 'block';
    document.getElementById('editIndex').value = index;
    document.getElementById('editName').value = db.products[index].name;
}

function saveUpdate() {
    const index = document.getElementById('editIndex').value;
    db.products[index].name = document.getElementById('editName').value;
    document.getElementById('updateForm').style.display = 'none';
    save();
}

render();
