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


function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
}


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


router.post('/login', requireUser,async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length > 0) {
      const user = result.rows[0];

   
      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (validPassword) {
        const token = generateToken(user); 
        res.json({ token }); 
      } else {
        res.status(400).send('Invalid credentials');
      }
    } else {
      res.status(404).send('User not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error logging in');
  }
});


router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving users');
  }
});


router.get('/:id', requireUser, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send('User not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving user');
  }
});


router.post('/', requireUser, async (req, res) => {
  const { name, email, password_hash } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [name, email, password_hash]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating user');
  }
});


router.put('/:id',requireUser, async (req, res) => {
  const { id } = req.params;
  const { name, email, password_hash } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2, password_hash = $3 WHERE id = $4 RETURNING *',
      [name, email, password_hash, id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send('User not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating user');
  }
});


router.delete('/:id', requireUser, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length > 0) {
      res.json({ message: 'User deleted' });
    } else {
      res.status(404).send('User not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting user');
  }
});

module.exports = router;
