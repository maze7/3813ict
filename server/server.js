require('dotenv').config();

const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Could not connect to MongoDB:', err);
})

// create webserver
const app = express();
app.use(cors());
app.use(express.json());
app.use('/auth', require('./src/routes/auth.routes'));
app.use('/group', require('./src/routes/group.routes'));

// Start Server
app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});