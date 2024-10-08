const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true},
    channel: { type: String, required: true },
    message: { type: String },
    images: [{ type: String }],
}, { timestamps: true });

const MessageModel = mongoose.model('Message', messageSchema);
module.exports = MessageModel;
