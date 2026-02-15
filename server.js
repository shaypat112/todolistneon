const express = require('express');
const { neon } = require('@neondatabase/serverless');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

//after the middelware
app.use(express.static('public'));


// Connect to Neon
const sql = neon(process.env.DATABASE_URL);

// Routes

// 1. GET all todos
app.get('/todos', async (req, res) => {
  try {
    const todos = await sql`SELECT * FROM todos ORDER BY created_at DESC`;
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. POST create a new todo
app.post('/todos', async (req, res) => {
  try {
    const { task } = req.body;
    const result = await sql`
      INSERT INTO todos (task) 
      VALUES (${task}) 
      RETURNING *
    `;
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. PUT update todo (mark complete/incomplete)
app.put('/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    const result = await sql`
      UPDATE todos 
      SET completed = ${completed} 
      WHERE id = ${id} 
      RETURNING *
    `;
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. DELETE a todo
app.delete('/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM todos WHERE id = ${id}`;
    res.json({ message: 'Todo deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});