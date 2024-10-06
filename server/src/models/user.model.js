const mongoose = require('mongoose');

const validRoles = ['superAdmin', 'groupAdmin', 'user'];

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    roles: {
        type: [String],
        required: true,
        default: ['user'],
    },
    avatar: { type: String, required: true },
    flagged: { type: Boolean, default: false },
    banned: { type: Boolean, default: false },
    socket: { type: String },
}, { timestamps: true });

const UserModel = mongoose.model('User', userSchema);
module.exports = UserModel;