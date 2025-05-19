const express = require('express');
const router = express.Router();
const { Pool } = require('pg');


const pool = new Pool({
  user: 'postgres',    
  host: 'localhost',        
  database: 'b37a', 
  password: 'Postme2%',
  port: 8500,            
});



router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving products');
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send('Product not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});


router.post('/', async (req, res) => {
  const { name, description, price } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO products (name, description, price) VALUES ($1, $2, $3) RETURNING *',
      [name, description, price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating product');
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length > 0) {
      res.json({ message: 'Product deleted' });
    } else {
      res.status(404).send('Product not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting product');
  }
});

module.exports = router;