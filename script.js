const API = 'http://localhost:5000/api';

// Banner notifications helper
function showToast(message, isError = false) {
    const banner = document.getElementById('feedback');
    banner.innerText = message;
    
    if (isError) {
        banner.className = "px-4 py-2 rounded-lg text-sm font-semibold shadow-sm flex items-center bg-rose-50 text-rose-700 border border-rose-100";
    } else {
        banner.className = "px-4 py-2 rounded-lg text-sm font-semibold shadow-sm flex items-center bg-emerald-50 text-emerald-700 border border-emerald-100";
    }
    banner.classList.remove('hidden');
    setTimeout(() => banner.classList.add('hidden'), 5000);
}

// Sidebar View Tabs switcher
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(`tab-${tabId}`).classList.remove('hidden');
    
    // Manage styling of active buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('hover:bg-slate-800', 'text-slate-400', 'hover:text-slate-200');
    });
    
    const activeBtn = document.getElementById(`btn-${tabId}`);
    activeBtn.classList.add('bg-blue-600', 'text-white');
    activeBtn.classList.remove('hover:bg-slate-800', 'text-slate-400', 'hover:text-slate-200');

    // Dynamically change visual header title text
    const titles = { products: 'Product Catalog', transactions: 'Process Operations', analytics: 'Procedures & Relations' };
    document.getElementById('page-title').innerText = titles[tabId];

    if (tabId === 'products') loadProducts();
}

// READ: Fetch products and compile table rows
async function loadProducts() {
    try {
        const res = await fetch(`${API}/products`);
        const data = await res.json();
        const tbody = document.getElementById('productTableBody');
        document.getElementById('record-count').innerText = `${data.length} Products`;

        if(data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-slate-400">No matching database product records found.</td></tr>`;
            return;
        }

        tbody.innerHTML = data.map(p => `
            <tr class="hover:bg-slate-50 transition border-b border-slate-100">
                <td class="p-4 pl-6 font-mono font-semibold text-slate-400">#${p.product_id}</td>
                <td class="p-4 font-semibold text-slate-900">${p.name}</td>
                <td class="p-4"><span class="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-md font-medium">${p.category}</span></td>
                <td class="p-4 font-mono font-medium text-slate-600">$${parseFloat(p.price).toFixed(2)}</td>
                <td class="p-4 pr-6 text-center space-x-3">
                    <button onclick="prepareUpdate(${p.product_id}, '${p.name}', '${p.category}', ${p.price})" class="text-blue-600 hover:text-blue-800 font-semibold transition">Edit</button>
                    <button onclick="deleteProduct(${p.product_id})" class="text-rose-600 hover:text-rose-800 font-semibold transition">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        showToast('Cannot connect to your backend database server. Ensure node server.js is running.', true);
    }
}

// CREATE or UPDATE form submissions
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('prodId').value;
    const payload = {
        name: document.getElementById('prodName').value,
        category: document.getElementById('prodCat').value,
        price: document.getElementById('prodPrice').value
    };

    const url = id ? `${API}/products/${id}` : `${API}/products`;
    const method = id ? 'PUT' : 'POST';

    try {
        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        showToast(id ? 'Product record updated successfully!' : 'New product entry successfully saved!');
        resetForm();
        loadProducts();
    } catch (err) {
        showToast('Error writing record entry adjustments.', true);
    }
});

// Set state parameters into update conditions
function prepareUpdate(id, name, cat, price) {
    document.getElementById('prodId').value = id;
    document.getElementById('prodName').value = name;
    document.getElementById('prodCat').value = cat;
    document.getElementById('prodPrice').value = price;
    
    document.getElementById('form-heading').innerHTML = `<i class="fa-solid fa-pen-to-square text-amber-500"></i> Modify Product Target #${id}`;
    document.getElementById('submitBtn').className = "flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm transition flex justify-center items-center gap-2";
    document.getElementById('cancelBtn').classList.remove('hidden');
}

function resetForm() {
    document.getElementById('productForm').reset();
    document.getElementById('prodId').value = '';
    document.getElementById('form-heading').innerHTML = `<i class="fa-solid fa-circle-plus text-blue-600"></i> Add New Product`;
    document.getElementById('submitBtn').className = "flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm transition flex justify-center items-center gap-2";
    document.getElementById('cancelBtn').classList.add('hidden');
}

// DELETE product configuration
async function deleteProduct(id) {
    if (confirm('Are you sure you want to drop this record from your product schema?')) {
        try {
            await fetch(`${API}/products/${id}`, { method: 'DELETE' });
            showToast('Product document deleted successfully.');
            loadProducts();
        } catch (err) {
            showToast('Failed to drop table row.', true);
        }
    }
}

// INVENTORY PURCHASES & SALES WITH SQL TRIGGER HOOKS
document.getElementById('purchaseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        supplier_id: document.getElementById('purSupId').value,
        product_id: document.getElementById('purProdId').value,
        quantity: document.getElementById('purQty').value,
        purchase_date: document.getElementById('purDate').value
    };
    const res = await fetch(`${API}/purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.error) showToast(result.error, true);
    else {
        showToast('Purchase completed. AfterPurchaseInsert trigger updated stocks dynamically.');
        document.getElementById('purchaseForm').reset();
    }
});

document.getElementById('saleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        product_id: document.getElementById('saleProdId').value,
        quantity: document.getElementById('saleQty').value,
        selling_price: document.getElementById('salePrice').value,
        sales_date: document.getElementById('saleDate').value
    };
    const res = await fetch(`${API}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.error) {
        // Captures trigger exception abort messages thrown directly from the SQL state signal rule check
        showToast(`Trigger Exception Blocked Sale: ${result.error}`, true);
    } else {
        showToast('Sale successful. BeforeSalesInsert verified stock allowances.');
        document.getElementById('saleForm').reset();
    }
});

// ROUTING ANALYTICS FOR CALL PROCEDURES AND CUSTOM QUERIES
async function executeProcedure(procRoute) {
    const res = await fetch(`${API}/procedures/${procRoute}`);
    const data = await res.json();
    const id = procRoute === 'stock-report' ? 'procStockOutput' : 'procReorderOutput';
    document.getElementById(id).innerText = JSON.stringify(data, null, 4);
}

async function runCustomQuery(queryId) {
    const res = await fetch(`${API}/queries/${queryId}`);
    const data = await res.json();
    // Re-use an output screen box under the criteria view tabs
    document.getElementById('procStockOutput').innerText = `[Custom Assignment Query ${queryId.toUpperCase()} Output]:\n\n` + JSON.stringify(data, null, 4);
    switchTab('analytics');
}

// Initial Boot Loader run
loadProducts();
