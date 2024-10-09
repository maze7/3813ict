const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const app = require('../server');
const UserModel = require('../src/models/user.model');
const jwt = require('jsonwebtoken');
const { expect } = chai;
const bcrypt = require('bcryptjs');

chai.use(chaiHttp);

describe('Auth Routes', () => {
    let token;
    const testUser = {
        _id: new Date().getTime().toString(),
        username: 'testuser',
        email: 'testuser@test.com',
        password: 'password123',
    }

    beforeEach(() => {
        // Generate a valid token for authenticated routes
        token = jwt.sign({ _id: testUser._id, username: testUser.username, user: testUser  }, process.env.JWT_SECRET, { expiresIn: '24h' });
    });

    afterEach(() => {
        sinon.restore(); // Restore original methods
    });

    describe('POST /register', () => {
        it('should register a new user successfully', (done) => {
            sinon.stub(UserModel, 'findOne').resolves(null); // No existing user
            sinon.stub(UserModel, 'create').resolves(testUser);

            chai.request(app)
                .post('/auth/register')
                .send(testUser)
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.have.property('message', 'User registered successfully.');
                    done();
                });
        });

        it('should return 400 if the username or email already exists', (done) => {
            sinon.stub(UserModel, 'findOne').resolves(testUser);

            chai.request(app)
                .post('/auth/register')
                .send(testUser)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('message', 'Username or email already in use.');
                    done();
                });
        });
    });

    describe('POST /login', () => {
        it('should log in a user with valid credentials', (done) => {
            sinon.stub(UserModel, 'findOne').resolves(testUser);
            sinon.stub(bcrypt, 'compare').resolves(true);

            chai.request(app)
                .post('/auth/login')
                .send({ username: 'testuser', password: 'password123' })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('token');
                    done();
                });
        });

        it('should return 401 for invalid credentials', (done) => {
            sinon.stub(UserModel, 'findOne').resolves(null);

            chai.request(app)
                .post('/auth/login')
                .send({ username: 'invaliduser', password: 'wrongpassword' })
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res.body).to.have.property('message', 'Invalid credentials');
                    done();
                });
        });

        it('should return 403 if the user is banned', (done) => {
            sinon.stub(UserModel, 'findOne').resolves({
                username: 'testuser',
                password: 'password123',
                banned: true,
            });

            chai.request(app)
                .post('/auth/login')
                .send({ username: 'testuser', password: 'password123' })
                .end((err, res) => {
                    expect(res).to.have.status(403);
                    expect(res.body).to.have.property('message', 'Banned user.');
                    done();
                });
        });
    });

    describe('POST /avatar', () => {
        let token;

        before(() => {
            token = jwt.sign({ _id: 'userId123', username: 'testuser' }, process.env.JWT_SECRET, { expiresIn: '24h' });
        });

        it('should update the avatar for an authenticated user', (done) => {
            sinon.stub(UserModel, 'findById').resolves(testUser);
            sinon.stub(UserModel, 'findByIdAndUpdate').resolves(testUser);

            chai.request(app)
                .post('/auth/avatar')
                .set('Authorization', `Bearer ${token}`)
                .send({ url: '/uploads/newAvatar.png' })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('token');
                    done();
                });
        });

        it('should return 401 if the user is invalid', (done) => {
            sinon.stub(UserModel, 'findById').resolves(testUser);
            sinon.stub(UserModel, 'findByIdAndUpdate').resolves(null);

            chai.request(app)
                .post('/auth/avatar')
                .set('Authorization', `Bearer ${token}`)
                .send({ url: '/uploads/newAvatar.png' })
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res.body).to.have.property('message', 'Invalid user.');
                    done();
                });
        });
    });
});
