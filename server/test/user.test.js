const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const app = require('../server');
const UserModel = require('../src/models/user.model');
const { expect } = chai;
const jwt = require('jsonwebtoken');
const middleware = require("../src/middleware/role.middleware");

chai.use(chaiHttp);

describe('User Routes', () => {
    let token;
    let UserModelStub = {};

    const testUser = {
        _id: 'userId123',
        username: 'testuser',
        email: 'testuser@test.com',
        roles: ['superAdmin'],
        banned: false,
        flagged: false,
    };

    before(() => {
        UserModelStub.findById = sinon.stub(UserModel, 'findById').resolves({
            ...testUser,
            save: sinon.stub().resolves({ ...testUser, flagged: true })
        });
        UserModelStub.findByIdAndUpdate = sinon.stub(UserModel, 'findByIdAndUpdate');
        UserModelStub.findByIdAndDelete = sinon.stub(UserModel, 'findByIdAndDelete');
        UserModelStub.find = sinon.stub(UserModel, 'find');
        token = jwt.sign({ _id: testUser._id, username: testUser.username, roles: testUser.roles }, process.env.JWT_SECRET, { expiresIn: '24h' });
    });

    after(() => {
        sinon.restore();
    });

    describe('GET /users/list', () => {
        it('should return all users', (done) => {
            UserModelStub.find.returns([testUser]);

            chai.request(app)
                .get('/user/list')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('array');
                    expect(res.body.length).to.equal(1);
                    expect(res.body[0]).to.have.property('username', 'testuser');
                    done();
                });
        });

        it('should return 500 if there is an error fetching users', (done) => {
            UserModelStub.find.throws(new Error('Error fetching users'));

            chai.request(app)
                .get('/user/list')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).to.have.status(500);
                    expect(res.body).to.have.property('message', 'Error getting users.');
                    done();
                });
        });
    });

    describe('PUT /user/:id', () => {
        it('should update a user successfully', (done) => {
            const updatedUser = { ...testUser, username: 'updateduser' };
            UserModelStub.findByIdAndUpdate.resolves(updatedUser);

            chai.request(app)
                .put(`/user/${testUser._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ user: { username: 'updateduser' } })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.user).to.have.property('username', 'updateduser');
                    done();
                });
        });

        it('should return 404 if the user is not found', (done) => {
            UserModelStub.findByIdAndUpdate.resolves(null);

            chai.request(app)
                .put(`/user/${testUser._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ user: { username: 'updateduser' } })
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body).to.have.property('message', 'User not found');
                    done();
                });
        });
    });

    describe('DELETE /user/:id', () => {
        it('should delete a user successfully', (done) => {
            UserModelStub.findByIdAndDelete.resolves({ deletedCount: 1 });

            chai.request(app)
                .delete(`/user/${testUser._id}`)
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('message', 'User deleted.');
                    done();
                });
        });

        it('should return 500 if there is an error deleting the user', (done) => {
            UserModelStub.findByIdAndDelete.throws(new Error('Error deleting user'));

            chai.request(app)
                .delete(`/user/${testUser._id}`)
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).to.have.status(500);
                    expect(res.body).to.have.property('message', 'Error deleting user.');
                    done();
                });
        });
    });

    describe('POST /user/:id/ban', () => {
        it('should ban the user successfully', (done) => {
            const updatedUser = { ...testUser, banned: true };
            UserModelStub.findById.resolves(testUser);
            UserModelStub.findByIdAndUpdate.resolves(updatedUser);

            chai.request(app)
                .post(`/user/${testUser._id}/ban`)
                .set('Authorization', `Bearer ${token}`)
                .send({ banned: true })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.status).to.be.true;
                    done();
                });
        });

        it('should return 404 if the user is not found', (done) => {
            UserModelStub.findByIdAndUpdate.resolves(null);

            chai.request(app)
                .post(`/user/${testUser._id}/ban`)
                .set('Authorization', `Bearer ${token}`)
                .send({ banned: true })
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body).to.have.property('message', 'User not found');
                    done();
                });
        });
    });

    describe('POST /user/:id/flag', () => {
        it('should flag the user successfully', (done) => {
            const updatedUser = { ...testUser, flagged: true };
            UserModelStub.findById.resolves(testUser);
            UserModelStub.findByIdAndUpdate.resolves(updatedUser);

            chai.request(app)
                .post(`/user/${testUser._id}/flag`)
                .set('Authorization', `Bearer ${token}`)
                .send({ flagged: true })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.status).to.be.true;
                    done();
                });
        });

        it('should return 404 if the user is not found', (done) => {
            UserModelStub.findByIdAndUpdate.resolves(null);

            chai.request(app)
                .post(`/user/${testUser._id}/flag`)
                .set('Authorization', `Bearer ${token}`)  // Token with 'superAdmin' role
                .send({ flagged: true })
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body).to.have.property('message', 'User not found');
                    done();
                });
        });
    });
});
