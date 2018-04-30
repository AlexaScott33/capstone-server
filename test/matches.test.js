'use strict';

const app = require('../index');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { TEST_DATABASE_URL, JWT_SECRET } = require('../config');
const { dbConnect, dbDisconnect } = require('../db-mongoose');

const Match = require('../models/match');
const Comment = require('../models/comment');
const User = require('../models/user');

const seedMatches = require('../db/matches');
const seedComments = require('../db/comments');
const seedUsers = require('../db/users');

// Set NODE_ENV to `test` to disable http layer logs
// You can do this in the command line, but this is cross-platform
process.env.NODE_ENV = 'test';

// Clear the console before each run
process.stdout.write('\x1Bc\n');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Matches API - Matches', function () {
  let user;
  let token;

  before(function() {
    return dbConnect(TEST_DATABASE_URL)
      .then(() => mongoose.connection.db.dropDatabase());
  });
  
  beforeEach(function () {
    return Promise.all([
      User.insertMany(seedUsers),
      User.ensureIndexes(),
      Match.insertMany(seedMatches),
      Match.ensureIndexes(),
      Comment.insertMany(seedComments),
      Comment.ensureIndexes()
    ]).then(([users]) => {
      user = users[0];
      token = jwt.sign({ user }, JWT_SECRET, { subject: user.username});
    });
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });
  
  after(function() {
    return dbDisconnect();
  });

  describe('GET /api/matches', function () {

    it('should return the correct number of Matches', function () {
      const dbPromise = Match.find({ userId: user.id });
      const apiPromise = chai.request(app)
        .get('/api/matches')
        .set('Authorization', `Bearer ${token}`);
      return Promise.all([dbPromise, apiPromise])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });
  });
});



