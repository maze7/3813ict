const mongoose = require('mongoose');

const validRoles = ['superAdmin', 'groupAdmin', 'user'];

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    roles: {
        type: [String],
        validate: {
            validator: function(roles) {
                // Ensure the array contains only "admin" or "user"
                const isValid = roles.every(role => validRoles.includes(role));
                // Ensure the array has at least one and at most two items
                return isValid && roles.length > 0 && roles.length <= 2;
            },
            message: props => `${props.value} is not a valid role array!`
        },
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