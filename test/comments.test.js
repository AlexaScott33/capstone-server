'use strict';

const { app } = require('../index');
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
process.env.NODE_ENV = 'test';

// Clear the console before each run
process.stdout.write('\x1Bc\n');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Matches API - Comments', function () {
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
    return mongoose.connection.db.dropDatabase()
      .catch(err => console.error(err));
  });
      
  after(function() {
    return dbDisconnect();
  });

  describe('GET /api/matches/:id/comments', function () {
    it('should return the correct number of comments for that match', function () {
      let data;
      return Match.findOne()
        .select('comments')
        .then(_data => {
          data = _data;
          return chai.request(app)
            .get(`/api/matches/${data.id}/comments`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
  
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('comments', 'id');
        });
    });
  });

  describe('POST /api/matches/:id/comments', function() {
    it('should create a new comment and save it to that match', function () {
      const newItem = {
        'content': 'new comment!',
      };
      let body;
      let data;
      return Match.findOne()
        .then((_data) => {
          data = _data;
          return chai.request(app)
            .post(`/api/matches/${data.id}/comments`)
            .set('Authorization', `Bearer ${token}`)
            .send(newItem);
        })
        .then(function (res) {
          body = res.body;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(body).to.be.a('object');
          expect(body).to.include.keys('id', 'date', 'home', 'away', 'score', 'comments');
        });
    });

    it('should return an error when comment is missing "content" field', function () {
      const newItem = {
        'foo': 'bar'
      };
  
      return chai.request(app)
        .post('/api/matches/:id/comments')
        .set('Authorization', `Bearer ${token}`)
        .send(newItem)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `content` in request body');
        });
    });
  });
});