const mongoose = require('mongoose');

const validRoles = ['superAdmin', 'groupAdmin', 'user'];

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
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
    flagged: { type: Boolean, required: true, default: false },
    banned: { type: Boolean, required: true, default: false },
    avatar: { type: String, required: true },
});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;