const jwt = require("jsonwebtoken");
const UserModel = require("./models/user.model");
const MessageModel = require("./models/message.model");
const { ExpressPeerServer } = require("peer");

module.exports = {
    connect: function(io, app, server) {
        console.log('Listening for socket and peer connections.');

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

        // Handle channel-specific communication for both chat and video
        const namespace = io.of(/^\/channel\/.+$/).on('connection', async (socket) => {
            const namespace = socket.nsp;
            console.log(`User connected to ${namespace.name} - ${socket.user.username} (Socket ID: ${socket.id})`);

            // Notify others in the channel that a new user joined
            socket.broadcast.emit('user-connected', socket.user._id);

            // Store the socket ID in the user's document for tracking purposes
            try {
                await UserModel.findByIdAndUpdate(socket.user._id, {
                    socket: socket.id
                });
            } catch (error) {
                console.error('Error updating user socket ID', error);
            }

            // Handle incoming messages from the client (for chat)
            socket.on('message', async (message) => {
                console.log(message);
                let msg = await MessageModel.create({
                    user: socket.user._id,
                    group: message.group,
                    channel: message.channel,
                    message: message.message,
                    images: message.images,
                });

                msg = await msg.populate('user group');
                console.log(`[${msg.channel}] ${msg.user.username}: ${msg.message}`);

                // Broadcast the message to all clients in the namespace (channel)
                namespace.emit('message', msg);
            });

            // Handle user joining the call, notify others
            socket.on('join-call', async (peer) => {
                socket.broadcast.emit('join-call', { peer, user: socket.user });
            });

            socket.on('leave-call', async (peer) => {
                socket.broadcast.emit('leave-call', peer);
            })

            // Handle user disconnection
            socket.on('disconnect', async () => {
                console.log(`User disconnected from ${namespace.name}: ${socket.user.username}`);

                // Notify others in the namespace that a user has disconnected
                socket.broadcast.emit('leave-call', socket.user._id);

                // Remove the socket ID from the user document on disconnect
                try {
                    await UserModel.findByIdAndUpdate(socket.user._id, {
                        socket: undefined
                    });
                } catch (error) {
                    console.error('Error removing socket ID on disconnect', error);
                }

                // Notify others in the namespace that a user has disconnected
                socket.broadcast.emit('user-disconnected', socket.user._id);
            });
        });

        // PeerServer for WebRTC connections
        const peerServer = ExpressPeerServer(server, {
            debug: true,
        });

        app.use('/peerjs', peerServer);

        // Apply the authentication middleware to the namespace
        namespace.use(authMiddleware);
    }
}
