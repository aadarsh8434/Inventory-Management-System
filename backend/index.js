import express from "express";
import pg from "pg";
import jwt from "jsonwebtoken";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url'; // For __dirname in ES6

const app = express();
const port = 3200;

// Resolve __dirname for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware configuration
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files from 'uploads' directory

// PostgreSQL client setup
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "opportuniti",
  password: "12345",
  port: 5432, // Default PostgreSQL port
});

db.connect()
  .then(() => console.log("Connected to PostgreSQL database"))
  .catch(err => console.error("Database connection error:", err));

app.get('/Inventory', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM Inventory');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
// Add a new inventory item
app.post('/Inventory', async (req, res) => {
  const { productname, stocklevel, reorderlevel, imageurl } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO Inventory (ProductName, StockLevel, ReorderLevel, ImageURL) VALUES ($1, $2, $3, $4) RETURNING *',
      [productname, stocklevel, reorderlevel, imageurl]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add inventory' });
  }
});

// Delete an inventory item
app.delete('/Inventory/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM Inventory WHERE ProductID = $1', [id]);
    res.status(200).json({ message: 'Inventory item deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete inventory' });
  }
});
// Get products at risk of stock out
app.get('/Inventory/AtRisk', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM Inventory
      WHERE StockLevel <= ReorderLevel
      ORDER BY StockLevel ASC
    `);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch at-risk products' });
  }
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
