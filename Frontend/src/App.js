import './App.css';
import React, { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  const [inventory, setInventory] = useState([]);
  const [newItem, setNewItem] = useState({ productname: "", stocklevel: 0, reorderlevel: 0, imageurl: "" });

  // Fetch inventory data
  useEffect(() => {
    axios.get("http://localhost:3200/Inventory")
      .then(response => setInventory(response.data))
      .catch(err => console.error("Error fetching inventory:", err));
  }, []);

  // Add new inventory item
  const addInventory = () => {
    axios.post("http://localhost:3200/Inventory", newItem)
      .then(response => {
        setInventory([...inventory, response.data]);
        setNewItem({ productname: "", stocklevel: 0, reorderlevel: 0, imageurl: "" });
      })
      .catch(err => console.error("Error adding inventory:", err));
  };

  // Delete inventory item
  const deleteInventory = (id) => {
    axios.delete(`http://localhost:3200/Inventory/${id}`)
      .then(() => setInventory(inventory.filter(item => item.productid !== id)))
      .catch(err => console.error("Error deleting inventory:", err));
  };

  // Calculate top products at risk of stock out
  const atRiskProducts = inventory.filter(item => item.stocklevel <= item.reorderlevel)
    .sort((a, b) => a.stocklevel - b.stocklevel); // Sort by stock level ascending

  return (
    <div style={{ fontFamily: "Arial, sans-serif", margin: "20px" }}>
      <h1>Inventory Management</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Product Name"
          value={newItem.productname}
          onChange={(e) => setNewItem({ ...newItem, productname: e.target.value })}
        />
        <input
          type="number"
          placeholder="Stock Level"
          value={newItem.stocklevel}
          onChange={(e) => setNewItem({ ...newItem, stocklevel: e.target.value })}
        />
        <input
          type="number"
          placeholder="Reorder Level"
          value={newItem.reorderlevel}
          onChange={(e) => setNewItem({ ...newItem, reorderlevel: e.target.value })}
        />
        <input
          type="text"
          placeholder="Image URL"
          value={newItem.imageurl}
          onChange={(e) => setNewItem({ ...newItem, imageurl: e.target.value })}
        />
        <button onClick={addInventory}>Add Item</button>
      </div>

      <h2>Top Products at Risk of Stock Out</h2>
      {atRiskProducts.length > 0 ? (
        <ul>
          {atRiskProducts.map(item => (
            <li key={item.productid}>
              {item.productname} - Stock: {item.stocklevel}, Reorder Level: {item.reorderlevel}
            </li>
          ))}
        </ul>
      ) : (
        <p>No products are at risk of stock out.</p>
      )}

      <table border="1" style={{ width: "100%", textAlign: "left" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Product Name</th>
            <th>Stock Level</th>
            <th>Reorder Level</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map(item => (
            <tr key={item.productid}>
              <td>{item.productid}</td>
              <td>{item.productname}</td>
              <td>{item.stocklevel}</td>
              <td>{item.reorderlevel}</td>
              <td>
                {item.imageurl && <img src={item.imageurl} alt={item.productname} style={{ width: "50px" }} />}
              </td>
              <td>
                <button onClick={() => deleteInventory(item.productid)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
