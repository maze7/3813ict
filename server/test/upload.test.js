const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const app = require('../server'); // Assuming this is where your Express app is exported
const path = require('path');
const fs = require('fs');
const jwt = require("jsonwebtoken");
const {Types} = require("mongoose");
const UserModel = require("../src/models/user.model");
const { expect } = chai;

chai.use(chaiHttp);

describe('File Upload Routes', () => {
    // Test data for the valid test cases
    const validImagePath = path.join(__dirname, 'test-files', 'test-image.png');
    const invalidImagePath = path.join(__dirname, 'test-files', 'test-image.txt');

    const testUser = {
        _id: new Types.ObjectId(),
        username: 'testuser',
        email: 'testuser@test.com',
        roles: ['groupAdmin'],
    };

    let token;
    let UserModelStub = {};

    before(() => {
        UserModelStub.findById = sinon.stub(UserModel, 'findById').resolves(testUser);
        token = jwt.sign({ _id: testUser._id, username: testUser.username, roles: testUser.roles }, process.env.JWT_SECRET, { expiresIn: '24h' });
    });

    after(() => {
        sinon.restore();
    })

    describe('POST /upload', () => {
        it('should successfully upload a valid image', (done) => {
            chai.request(app)
                .post('/upload')
                .set('Authorization', `Bearer ${token}`)
                .attach('file', fs.readFileSync(validImagePath), 'test-image.png') // Simulating image upload
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('imageUrl');
                    expect(res.body).to.have.property('message', 'Image uploaded successfully!');
                    done();
                });
        });

        it('should return 400 if no file is uploaded', (done) => {
            chai.request(app)
                .post('/upload')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('message', 'No file uploaded');
                    done();
                });
        });

        it('should return an error if the file is too large', (done) => {
            chai.request(app)
                .post('/upload')
                .set('Authorization', `Bearer ${token}`)
                .attach('file', Buffer.alloc(6 * 1024 * 1024), 'large-image.png') // Simulating a large file upload (6MB)
                .end((err, res) => {
                    expect(res).to.have.status(500);
                    done();
                });
        });

        it('should return an error for invalid file format', (done) => {
            chai.request(app)
                .post('/upload')
                .set('Authorization', `Bearer ${token}`)
                .attach('file', fs.readFileSync(invalidImagePath), 'test-image.txt') // Simulating upload of an invalid file type
                .end((err, res) => {
                    expect(res).to.have.status(500);
                    done();
                });
        });
    });
});
