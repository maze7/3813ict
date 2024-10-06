const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model'); // Import the UserModel

async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401); // If no token is present, return Unauthorized

    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
        if (err) return res.sendStatus(403); // If token is invalid, return Forbidden

        try {
            // Fetch the user from the UserModel using the user ID from the token
            const foundUser = await UserModel.findById(user._id)
            if (!foundUser) return res.sendStatus(403); // If user is not found, return Forbidden

            // Attach the found user to the request object
            req.user = foundUser;
            next(); // Proceed to the next middleware or route handler
        } catch (error) {
            return res.status(500).json({ message: 'Error fetching user', error: error.message });
        }
    });
}

module.exports = authenticateToken;
