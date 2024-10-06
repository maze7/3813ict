require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const sockets = require('./src/socket');
const cors = require('cors');
const db = require('./src/util/db');
const winston = require('winston');

// Initialize database
db();

// Create webserver
const app = express();
const server = http.createServer(app); // Use the HTTP server for both HTTP and WebSockets
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Configure routes
app.use(cors());
app.use(express.json());
app.use('/auth', require('./src/routes/auth.routes'));
app.use('/group', require('./src/routes/group.routes'));
app.use('/user', require('./src/routes/user.routes'));
app.use('/messages', require('./src/routes/message.routes'));

// Create logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.cli(),
    transports: [new winston.transports.Console()],
    exceptionHandlers: [new winston.transports.Console()],
    rejectionHandlers: [new winston.transports.Console()],
});

// Set up WebSocket server
sockets.connect(io);

// Start Server
server.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
