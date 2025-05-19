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
    const result = await pool.query('SELECT * FROM reviews');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving');
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM reviews WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving review');
  }
});

router.post('/', async (req, res) => {
  const { user_id, product_id, rating, content } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO reviews (user_id, product_id, rating, content) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, product_id, rating, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating');
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM reviews WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length > 0) {
      res.json({ message: 'Review deleted' });
    } 
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting review');
  }
});

module.exports = router;

