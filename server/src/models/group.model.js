const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    acronym: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    pendingMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    pendingAdmins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    banned: [{type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    channels: [channelSchema],
});

const GroupModel = mongoose.model('Group', groupSchema);

module.exports = GroupModel;