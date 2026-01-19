const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
try {
  require('dotenv').config();
} catch (error) {
  console.log('dotenv not available, using default values');
}

const app = express();
app.use(cors());
app.use(express.json());

let db;
try {
  db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'todo_app'
  });

  db.connect((err) => {
    if (err) {
      console.error('Database connection failed:', err.message);
      console.log('Server will start without database connection. Please set up MySQL database.');
    } else {
      console.log('Connected to MySQL database');
    }
  });
} catch (error) {
  console.error('Failed to create database connection:', error.message);
  console.log('Server will start without database connection.');
}

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key', (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.userId = decoded.id;
    next();
  });
};

// Routes
app.post('/api/signup', async (req, res) => {
  if (!db) {
    return res.status(500).json({ error: 'Database not connected. Please set up MySQL.' });
  }
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error. Please ensure MySQL is set up.' });
      }
      res.status(201).json({ message: 'User registered successfully' });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/signin', (req, res) => {
  if (!db) {
    return res.status(500).json({ error: 'Database not connected. Please set up MySQL.' });
  }
  const { username, password } = req.body;
  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error. Please ensure MySQL is set up.' });
    }
    if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = results[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'your_secret_key', { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, username: user.username } });
  });
});

app.get('/api/todos', verifyToken, (req, res) => {
  if (!db) {
    return res.status(500).json({ error: 'Database not connected. Please set up MySQL.' });
  }
  db.query('SELECT * FROM todos WHERE user_id = ?', [req.userId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error. Please ensure MySQL is set up.' });
    }
    res.json(results);
  });
});

app.post('/api/todos', verifyToken, (req, res) => {
  if (!db) {
    return res.status(500).json({ error: 'Database not connected. Please set up MySQL.' });
  }
  const { text } = req.body;
  db.query('INSERT INTO todos (text, user_id) VALUES (?, ?)', [text, req.userId], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error. Please ensure MySQL is set up.' });
    }
    res.status(201).json({ id: result.insertId, text, completed: false });
  });
});

app.put('/api/todos/:id', verifyToken, (req, res) => {
  if (!db) {
    return res.status(500).json({ error: 'Database not connected. Please set up MySQL.' });
  }
  const { id } = req.params;
  const { completed } = req.body;
  db.query('UPDATE todos SET completed = ? WHERE id = ? AND user_id = ?', [completed, id, req.userId], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error. Please ensure MySQL is set up.' });
    }
    res.json({ message: 'Todo updated' });
  });
});

app.delete('/api/todos/:id', verifyToken, (req, res) => {
  if (!db) {
    return res.status(500).json({ error: 'Database not connected. Please set up MySQL.' });
  }
  const { id } = req.params;
  db.query('DELETE FROM todos WHERE id = ? AND user_id = ?', [id, req.userId], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error. Please ensure MySQL is set up.' });
    }
    res.json({ message: 'Todo deleted' });
  });
});

const PORT = process.env.PORT || 9999;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});