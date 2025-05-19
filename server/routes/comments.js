const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { requireUser } = require('../middleware/auth');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'b37a',
  password: '',
  port: 8500,
});

// Secret key for signing JWT
const SECRET_KEY = 'key';


function verifyToken(req, res, next) {
  const token = req.header('Authorization') && req.header('Authorization').split(' ')[1]; 

  if (!token) {
    return res.status(403).send('Access Denied');
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; 
    next(); 
  } catch (err) {
    console.error(err);
    res.status(401).send('Invalid Token');
  }
}


router.post('/', verifyToken, async (req, res) => {
  const { product_id, content } = req.body;
  const user_id = req.user.id;

  try {
    const result = await pool.query(
      'INSERT INTO comments (user_id, product_id, content) VALUES ($1, $2, $3) RETURNING *',
      [user_id, product_id, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating comment');
  }
});


router.get('/:product_id', verifyToken, async (req, res) => {
  const { product_id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM comments WHERE product_id = $1', [product_id]);
    if (result.rows.length > 0) {
      res.json(result.rows);
    } else {
      res.status(404).send('No comments found for this product');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving comments');
  }
});


router.get('/:product_id/:comment_id', verifyToken, async (req, res) => {
  const { product_id, comment_id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM comments WHERE id = $1 AND product_id = $2', [comment_id, product_id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send('Comment not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving comment');
  }
});


router.put('/:product_id/:comment_id', verifyToken, async (req, res) => {
  const { product_id, comment_id } = req.params;
  const { content } = req.body;
  const user_id = req.user.id; 

  try {
    const result = await pool.query(
      'UPDATE comments SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND product_id = $3 AND user_id = $4 RETURNING *',
      [content, comment_id, product_id, user_id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send('Comment not found or unauthorized');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating comment');
  }
});


router.delete('/:product_id/:comment_id', verifyToken, async (req, res) => {
  const { product_id, comment_id } = req.params;
  const user_id = req.user.id;

  try {
    const result = await pool.query(
      'DELETE FROM comments WHERE id = $1 AND product_id = $2 AND user_id = $3 RETURNING *',
      [comment_id, product_id, user_id]
    );
    if (result.rows.length > 0) {
      res.json({ message: 'Comment deleted' });
    } else {
      res.status(404).send('Comment not found or unauthorized');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting comment');
  }
});

module.exports = router;
