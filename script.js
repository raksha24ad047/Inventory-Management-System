function showProducts() {

document.getElementById("output").innerHTML = `
<h2>Products</h2>

<table border="1">
<tr>
<th>ID</th>
<th>Name</th>
<th>Price</th>
</tr>

<tr>
<td>1</td>
<td>Laptop</td>
<td>50000</td>
</tr>

<tr>
<td>2</td>
<td>Mouse</td>
<td>500</td>
</tr>

<tr>
<td>3</td>
<td>Keyboard</td>
<td>1000</td>
</tr>

</table>
`;

}

function showSuppliers() {

document.getElementById("output").innerHTML = `
<h2>Suppliers</h2>

<table border="1">
<tr>
<th>ID</th>
<th>Name</th>
</tr>

<tr>
<td>1</td>
<td>Dell</td>
</tr>

<tr>
<td>2</td>
<td>HP</td>
</tr>

<tr>
<td>3</td>
<td>Lenovo</td>
</tr>

</table>
`;

}

function showWarehouse() {

document.getElementById("output").innerHTML = `
<h2>Warehouse</h2>

<table border="1">
<tr>
<th>ID</th>
<th>Name</th>
<th>Stock</th>
</tr>

<tr>
<td>101</td>
<td>Central Warehouse</td>
<td>1500</td>
</tr>

<tr>
<td>102</td>
<td>North Warehouse</td>
<td>800</td>
</tr>

</table>
`;

}
