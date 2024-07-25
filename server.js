const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const authenticateJWT = require('./authMiddleware'); // Importez le middleware personnalisé

const app = express();
const port = 3000;
const secretKey = 'your-secret-key'; // Remplacez par une clé secrète appropriée
const corsOptions = {
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};

// Middleware
app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware pour journaliser les requêtes entrantes
app.use((req, res, next) => {
    console.log('Incoming request:', req.method, req.url);
    console.log('Headers:', req.headers);
    next();
});

// Appliquez le middleware d'authentification JWT aux routes sauf `/api/signup` et `/api/signin`
app.use((req, res, next) => {
    if (req.path === '/api/signup' || req.path === '/api/signin') {
        return next();
    }
    authenticateJWT(req, res, next);
});

// Middleware de débogage pour afficher le contenu de req.user après l'authentification
app.use((req, res, next) => {
    console.log('After authenticateJWT - req.user:', req.user);
    next();
});

// Middleware de vérification des rôles
function checkRole(role) {
  return (req, res, next) => {
      console.log('checkRole - req.user:', req.user); // Ajoutez cette ligne pour déboguer
      if (!req.user || req.user.role !== role) {
          return res.status(403).json({ error: 'Access denied' });
      }
      next();
  };
}

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'garage_db'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Database');
});

// Routes
app.post('/api/signup', (req, res) => {
    const { lastname, firstname, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    const sql = 'INSERT INTO users (lastname, firstname, email, password, role) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [lastname, firstname, email, hashedPassword, 'user'], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
            return;
        }
        res.status(201).json({ message: 'User registered' });
    });
});

app.post('/api/signin', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
            return;
        }

        if (results.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const user = results[0];
        const passwordIsValid = bcrypt.compareSync(password, user.password);

        if (!passwordIsValid) {
            res.status(401).json({ error: 'Invalid password' });
            return;
        }

        const token = jwt.sign({ id: user.id, role: user.role }, secretKey, { expiresIn: 86400 });
        res.status(200).json({ auth: true, token, role: user.role });
    });
});

app.put('/api/users/:id/role', (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'user'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    const sql = 'UPDATE users SET role = ? WHERE id = ?';
    db.query(sql, [role, id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
            return;
        }
        res.status(200).json({ message: 'User role updated' });
    });
});

// Exemple de route sécurisée pour le dashboard
app.get('/api/dashboard', checkRole('admin'), (req, res) => {
    res.status(200).json({ message: 'Dashboard accessible uniquement aux utilisateurs authentifiés' });
});

app.get('/api/statistics', checkRole('admin'), (req, res) => {
    const sql = 'SELECT COUNT(*) AS clientCount FROM users';
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
            return;
        }
        res.status(200).json(results[0]);
    });
});

app.get('/api/clients', checkRole('admin'), (req, res) => {
    const sql = 'SELECT * FROM users';
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
            return;
        }
        console.log('Returning clients:', results);
        res.status(200).json(results);
    });
});

app.put('/api/clients/:id', checkRole('admin'), (req, res) => {
    const { id } = req.params;
    const { lastname, firstname, email } = req.body;
    const sql = 'UPDATE users SET lastname = ?, firstname = ?, email = ? WHERE id = ?';
    db.query(sql, [lastname, firstname, email, id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
            return;
        }
        res.status(200).json({ message: 'User updated' });
    });
});

app.delete('/api/clients/:id', checkRole('admin'), (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM users WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
            return;
        }
        res.status(200).json({ message: 'User deleted' });
    });
});

app.use(express.static(path.join(__dirname, "./client/dist")));
app.get("*", (_, res) => {
    res.sendFile(
        path.join(__dirname, "./client/dist/index.html")
    );
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
