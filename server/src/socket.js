const jwt = require("jsonwebtoken");
const UserModel = require("./models/user.model");
const MessageModel = require("./models/message.model");

module.exports = {
    connect: function(io) {
        console.log('Listening for socket connections.');

        // Authentication middleware for socket
        const authMiddleware = async (socket, next) => {
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
        };

        // Listen for connections to each channel
        const namespace = io.of(/^\/channel\/.+$/).on('connection', async (socket) => {
            const namespace = socket.nsp;
            console.log(`User connected to ${namespace.name} - ${socket.user.username} (Socket ID: ${socket.id})`);


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
                namespace.emit('message', msg);
            });

            // Handle disconnection
            socket.on('disconnect', async () => {
                console.log(`User disconnected from ${namespace.name}: ${socket.user.username}`);

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

        namespace.use(authMiddleware);
    }
}
