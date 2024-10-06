const jwt = require("jsonwebtoken");
const UserModel = require("./models/user.model");
const MessageModel = require("./models/message.model");

module.exports = {
    connect: function(io) {
        console.log('Listening for socket connections.');

        // Authentication middleware for socket
        io.use(async (socket, next) => {
            const token = socket.handshake.query.token;

            if (!token) {
                return next(new Error('Authentication error: Token is required'));
            }

            jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
                if (err) return next(new Error('Authentication error: Invalid token'));

                try {
                    // Fetch user by ID decoded from the token
                    const foundUser = await UserModel.findById(decodedToken._id);
                    if (!foundUser) return next(new Error('Authentication error: User not found'));

                    // Associate the user with the socket
                    socket.user = foundUser;  // Store user info in the socket
                    next(); // Authentication successful, proceed
                } catch (error) {
                    console.error('Database error during authentication', error);
                    return next(new Error('Authentication error: Database failure'));
                }
            });
        });

        // Handle authenticated socket connection
        io.on('connection', async (socket) => {
            console.log(`User connected: ${socket.user.username} (Socket ID: ${socket.id})`);

            // Store the socket ID in the user's document
            try {
                await UserModel.findByIdAndUpdate(socket.user._id, {
                    socket: socket.id
                });
            } catch (error) {
                console.error('Error updating user socket ID', error);
            }

            // Listen for incoming messages from the client
            socket.on('message', async (message) => {
                let msg = await MessageModel.create({
                    user: socket.user._id,
                    group: message.group,
                    channel: message.channel,
                    message: message.message,
                });

                msg = await msg.populate('user group');
                console.log(`[${msg.channel}] ${msg.user.username}: ${msg.message}`);

                // Broadcast message to all connected clients
                io.emit('message', msg);
            });

            // Handle disconnection
            socket.on('disconnect', async () => {
                console.log(`User disconnected: ${socket.user.username}`);

                // Remove the socket ID from the user document on disconnect
                try {
                    await UserModel.findByIdAndUpdate(socket.user._id, {
                        socket: undefined
                    });
                } catch (error) {
                    console.error('Error removing socket ID on disconnect', error);
                }
            });
        });
    }
}
