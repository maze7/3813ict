const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const app = require('../server');
const GroupModel = require('../src/models/group.model');
const UserModel = require('../src/models/user.model');
const { expect } = chai;
const jwt = require('jsonwebtoken');
const middleware = require("../src/middleware/role.middleware");

chai.use(chaiHttp);

describe('Group Routes', () => {
    let token;
    let GroupModelStub = {};
    let UserModelStub = {};

    const testUser = {
        _id: 'userId123',
        username: 'testuser',
        email: 'testuser@test.com',
        roles: ['groupAdmin'],
    };

    const testGroup = {
        _id: 'groupId123',
        name: 'Test Group',
        acronym: 'TG',
        owner: { _id: testUser._id }, // Now an object with _id
        admins: [{ _id: testUser._id }], // Array of objects
        members: [],
        pendingMembers: [],
        banned: [],
        channels: [],
    };

    before(() => {
        UserModelStub.findById = sinon.stub(UserModel, 'findById').resolves(testUser);
        GroupModelStub.create = sinon.stub(GroupModel, 'create');
        GroupModelStub.find = sinon.stub(GroupModel, 'find');
        GroupModelStub.findById = sinon.stub(GroupModel, 'findById');
        GroupModelStub.findByIdAndUpdate = sinon.stub(GroupModel, 'findByIdAndUpdate');
        GroupModelStub.deleteOne = sinon.stub(GroupModel, 'deleteOne');
        token = jwt.sign({ _id: testUser._id, username: testUser.username, roles: testUser.roles }, process.env.JWT_SECRET, { expiresIn: '24h' });
    })

    after(() => {
        sinon.restore();
    });

    describe('POST /groups/', () => {
        it('should create a new group successfully', (done) => {
            GroupModelStub.create.resolves(testGroup);
            GroupModelStub.findById.returns({ populate: sinon.stub().resolves(testGroup) });
            GroupModelStub.findByIdAndUpdate.returns({ populate: sinon.stub().resolves(testGroup) });

            chai.request(app)
                .post('/group/')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Test Group', acronym: 'TG' })
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.have.property('name', 'Test Group');
                    done();
                });
        });
    });

    describe('PUT /group/:id', () => {
        it('should update the group name and acronym successfully', (done) => {
            const updatedGroup = { ...testGroup, name: 'Updated Group', acronym: 'UG' };
            GroupModelStub.findById.resolves(testGroup);
            GroupModelStub.findByIdAndUpdate.returns({
                populate: sinon.stub().resolves(updatedGroup)
            });

            chai.request(app)
                .put(`/group/${testGroup._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Updated Group', acronym: 'UG' })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('name', 'Updated Group');
                    expect(res.body).to.have.property('acronym', 'UG');
                    done();
                });
        });

        it('should return 404 if the group is not found', (done) => {
            GroupModelStub.findByIdAndUpdate.returns({
                populate: sinon.stub().resolves(null)
            });

            chai.request(app)
                .put(`/group/${testGroup._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Updated Group' })
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body).to.have.property('message', 'Group not found');
                    done();
                });
        });
    });

    describe('GET /group/list', () => {
        it('should return all groups', (done) => {
            GroupModelStub.find.returns({
                populate: sinon.stub().resolves([testGroup])
            });

            chai.request(app)
                .get('/group/list')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    expect(res.body.length).to.equal(1);
                    expect(res.body[0]).to.have.property('name', 'Test Group');
                    done();
                });
        });

        it('should return 500 if there is an error fetching the groups', (done) => {
            GroupModelStub.find.throws(new Error('Error fetching groups'));

            chai.request(app)
                .get('/group/list')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).to.have.status(500);
                    expect(res.body).to.have.property('message', 'Error fetching groups');
                    done();
                });
        });
    });

    describe('DELETE /group/:id', () => {
        it('should delete a group successfully', (done) => {
            GroupModelStub.deleteOne.resolves({ deletedCount: 1 });

            chai.request(app)
                .delete(`/group/${testGroup._id}`)
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('message', 'Group deleted successfully');
                    done();
                });
        });

        it('should return 500 if there is an error deleting the group', (done) => {
            GroupModelStub.deleteOne.throws(new Error('Error deleting group'));

            chai.request(app)
                .delete(`/group/${testGroup._id}`)
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).to.have.status(500);
                    expect(res.body).to.have.property('message', 'Error deleting group');
                    done();
                });
        });
    });

    describe('POST /group/:id/channel', () => {
        it('should create a new channel in the group', (done) => {
            GroupModelStub.findByIdAndUpdate.returns({
                populate: sinon.stub().resolves({
                    ...testGroup,
                    channels: [{ _id: 'channelId123', name: 'New Channel', members: [testUser._id] }],
                })
            });

            chai.request(app)
                .post(`/group/${testGroup._id}/channel`)
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'New Channel' })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.channels).to.be.an('array');
                    expect(res.body.channels.length).to.equal(1);
                    expect(res.body.channels[0]).to.have.property('name', 'New Channel');
                    done();
                });
        });

        it('should return 404 if the group is not found', (done) => {
            GroupModelStub.findByIdAndUpdate.returns({
                populate: sinon.stub().resolves(null)
            });

            chai.request(app)
                .post(`/group/${testGroup._id}/channel`)
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'New Channel' })
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body).to.have.property('message', 'Group not found');
                    done();
                });
        });
    });
});
