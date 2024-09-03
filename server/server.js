require('dotenv').config();

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());

// Temporary in-memory user database (before I setup mongo)

// Register route
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    users.push({ username, password: passwordHash });
    res.status(201).json({ message: 'User registered successfully.' });
});

// Login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

// Protected Route
app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: `Hello, ${req.user.username}! You are authenticated.` });
});

// Middleware to Authenticate Token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Start Server
app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});