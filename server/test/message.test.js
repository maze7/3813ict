const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const app = require('../server');
const MessageModel = require('../src/models/message.model');
const { expect } = chai;
const jwt = require('jsonwebtoken');
const UserModel = require('../src/models/user.model');
const mongoose = require("mongoose");

chai.use(chaiHttp);

describe('Message Routes', () => {
    let token;
    let MessageModelStub = {};
    let UserModelStub = {};

    const testUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'testuser',
        email: 'testuser@test.com',
        roles: ['user', 'groupAdmin'],
    };

    const testMessage = {
        _id: new mongoose.Types.ObjectId(),
        content: 'This is a test message',
        user: testUser._id,
        group: new mongoose.Types.ObjectId(),
        channel: new mongoose.Types.ObjectId(),
        createdAt: new Date(),
    };

    const testGroup = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Test Group',
    };

    const testChannel = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Test Channel',
    };

    before(() => {
        UserModelStub.findById = sinon.stub(UserModel, 'findById');
        MessageModelStub.find = sinon.stub(MessageModel, 'find');
        token = jwt.sign({ _id: testUser._id, username: testUser.username, roles: testUser.roles }, process.env.JWT_SECRET, { expiresIn: '24h' });
        UserModelStub.findById.resolves(testUser);
    });

    after(() => {
        sinon.restore();
    });

    describe('GET /messages/:groupId/:channelId', () => {
        it('should return all messages for the specified group and channel', (done) => {
            MessageModelStub.find.returns({
                populate: sinon.stub().returns({
                    sort: sinon.stub().resolves([testMessage])
                })
            });

            chai.request(app)
                .get(`/messages/${testGroup._id}/${testChannel._id}`)
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    expect(res.body.length).to.equal(1);
                    expect(res.body[0]).to.have.property('content', 'This is a test message');
                    done();
                });
        });

        it('should return 500 if there is an error fetching messages', (done) => {
            MessageModelStub.find.throws(new Error('Error fetching messages'));

            chai.request(app)
                .get(`/messages/${testGroup._id}/${testChannel._id}`)
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).to.have.status(500);
                    expect(res.body).to.have.property('message', 'Error getting messages');
                    done();
                });
        });

        it('should return an empty array if no messages are found', (done) => {
            MessageModelStub.find.returns({
                populate: sinon.stub().returns({
                    sort: sinon.stub().resolves([])
                })
            });

            chai.request(app)
                .get(`/messages/${testGroup._id}/${testChannel._id}`)
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array').that.is.empty;
                    done();
                });
        });
    });
});
