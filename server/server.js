require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const db = require('./src/util/db');
const winston = require('winston');

db();

// create webserver
const app = express();
const server = http.createServer(app);

// configure routes
app.use(cors());
app.use(express.json());
app.use('/auth', require('./src/routes/auth.routes'));
app.use('/group', require('./src/routes/group.routes'));
app.use('/user', require('./src/routes/user.routes'));

// create logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.cli(),
    transports: [new winston.transports.Console()],
    exceptionHandlers: [new winston.transports.Console()],
    rejectionHandlers: [new winston.transports.Console()],
});

// set up websocket server
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
})

// Start Server
app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});