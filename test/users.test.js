'use strict';

const { app } = require('../index');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { TEST_DATABASE_URL } = require('../config');
const { dbConnect, dbDisconnect } = require('../db-mongoose');

const User = require('../models/user');

// Set NODE_ENV to `test` to disable http layer logs
process.env.NODE_ENV = 'test';

// Clear the console before each run
process.stdout.write('\x1Bc\n');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Matches API - Users', function () {
  const username = 'exampleUser';
  const password = 'examplePass';
  const firstname = 'Example';
  const lastname = 'User';

  before(function() {
    return dbConnect(TEST_DATABASE_URL)
      .then(() => mongoose.connection.db.dropDatabase());
  });
      
  beforeEach(function () {
    User.ensureIndexes();
  });
    
  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });
      
  after(function() {
    return dbDisconnect();
  });

  describe('/api/users', function () {
    describe('POST', function () {
      it('Should create a new user', function () {
        const testUser = { username, password, firstname, lastname };

        let res;
        return chai.request(app)
          .post('/api/users')
          .send(testUser)
          .then(_res => {
            res = _res;
            expect(res).to.have.status(201);
            expect(res.body).to.be.a('object');
            expect(res.body).to.have.keys('id', 'username', 'firstname', 'lastname');

            expect(res.body.id).to.exist;
            expect(res.body.username).to.equal(testUser.username);
            expect(res.body.firstname).to.equal(testUser.firstname);
            expect(res.body.lastname).to.equal(testUser.lastname);

            return User.findOne({ username });
          })
          .then(user => {
            expect(user).to.exist;
            expect(user.id).to.equal(res.body.id);
            expect(user.firstname).to.equal(testUser.firstname);
            expect(user.lastname).to.equal(testUser.lastname);
            return user.validatePassword(password);
          })
          .then(isValid => {
            expect(isValid).to.be.true;
          });
      });

      it('Should reject users with missing username', function () {
        const testUser = { password, firstname, lastname };
        return chai.request(app)
          .post('/api/users')
          .send(testUser)
          .catch(err => err.response)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Missing username in request body');
          });
      });

      it('Should reject users with missing password', function() {
        const testUser = { username, firstname, lastname };
        return chai.request(app)
          .post('/api/users')
          .send(testUser)
          .catch(err => err.response)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Missing password in request body');
          });
      });

      it('Should reject users with non-string username', function() {
        const testUser = {
          username: 1234,
          password,
          firstname,
          lastname
        };
        return chai.request(app)
          .post('/api/users')
          .send(testUser)
          .catch(err => err.response)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Field: \'username\' must be type String');
          });
      });

      it('Should reject users with non-string password', function() {
        const testUser = {
          username,
          password: 1234,
          firstname,
          lastname
        };
        return chai.request(app)
          .post('/api/users')
          .send(testUser)
          .catch(err => err.response)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Field: \'password\' must be type String');
          });
      });

      it('Should reject users with non-trimmed username', function() {
        const testUser = {
          username: ` ${username} `,
          password,
          firstname,
          lastname
        };
        return chai.request(app)
          .post('/api/users')
          .send(testUser)
          .catch(err => err.response)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Field: \'username\' cannot start or end with whitespace');
          });
      });

      it('Should reject users with non-trimmed password', function() {
        const testUser = {
          username,
          password: ` ${password} `,
          firstname,
          lastname
        };
        return chai.request(app)
          .post('/api/users')
          .send(testUser)
          .catch(err => err.response)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Field: \'password\' cannot start or end with whitespace');
          });
      });

      it('Should reject users with empty username', function() {
        const testUser = {
          username: '',
          password,
          firstname,
          lastname
        };
        return chai.request(app)
          .post('/api/users')
          .send(testUser)
          .catch(err => err.response)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Field: \'username\' must be at least 1 characters long');
          });
      });

      it('Should reject users with passwords less than 8 characters', function() {
        const testUser = {
          username,
          password: 'test',
          firstname,
          lastname
        };
        return chai.request(app)
          .post('/api/users')
          .send(testUser)
          .catch(err => err.response)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Field: \'password\' must be at least 8 characters long');
          });
      });

      it('Should reject users with passwords greater than 72 characters', function() {
        const testUser = {
          username,
          password: new Array(73).fill('a').join(''),
          firstname,
          lastname
        };
        return chai.request(app)
          .post('/api/users')
          .send(testUser)
          .catch(err => err.response)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Field: \'password\' must be at most 72 characters long');
          });
      });

      it('Should reject users with duplicate username', function() {
        const testUser = {
          username,
          password,
          firstname,
          lastname
        };
        return User.create({
          username,
          password,
          firstname,
          lastname
        })
          .then(() => {
            return chai.request(app)
              .post('/api/users')
              .send(testUser)
              .catch(err => err.response)
              .then(res => {
                expect(res).to.have.status(400);
                expect(res.body.message).to.equal('The username already exists');
              });
          });
      });

      it('Should trim firstname', function() {
        const testUser = {
          username,
          password,
          firstname: ` ${firstname} `,
          lastname
        };
        //first call api sending in testUser
        return chai.request(app)
          .post('/api/users')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(201);

            expect(res.body).to.be.a('object');
            expect(res.body).to.have.keys('id', 'username', 'firstname', 'lastname');

            expect(res.body.username).to.equal(username);
            expect(res.body.firstname).to.equal(firstname);
            //find user in db and check
            return User.findOne({ username })
              .then(user => {
                expect(user).to.not.be.null;
                expect(user.firstname).to.equal(firstname);
              });
          }); 
      });

      it('Should trim lastname', function() {
        const testUser = {
          username,
          password,
          firstname,
          lastname: ` ${lastname} `
        };
        //first call api sending in testUser
        return chai.request(app)
          .post('/api/users')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(201);

            expect(res.body).to.be.a('object');
            expect(res.body).to.have.keys('id', 'username', 'firstname', 'lastname');

            expect(res.body.username).to.equal(username);
            expect(res.body.lastname).to.equal(lastname);
            //find user in db and check
            return User.findOne({ username })
              .then(user => {
                expect(user).to.not.be.null;
                expect(user.lastname).to.equal(lastname);
              });
          }); 
      });

      
    
    
    
    
    });






  });
});