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

describe.only('Matches API - Matches', function () {
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
      const dbPromise = Match.find();
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

  it('should return a list with the correct right fields', function () {
    const dbPromise = Match.find();
    const apiPromise = chai.request(app)
      .get('/api/matches')
      .set('Authorization', `Bearer ${token}`);

    return Promise.all([dbPromise, apiPromise])
      .then(([data, res]) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body).to.have.length(data.length);
        res.body.forEach(function (item) {
          expect(item).to.be.a('object');
          expect(item).to.have.keys('id', 'date', 'home', 'away', 'score', 'comments');
        });
      });
  });

  describe('GET /api/matches/:id', function () {

    it('should return correct matches', function () {
      let data;
      return Match.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app)
            .get(`/api/matches/${data.id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'date', 'home', 'away', 'score', 'comments');

          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
        });
    });

    it('should respond with a 400 for improperly formatted id', function () {
      const badId = '99-99-99';

      return chai.request(app)
        .get(`/api/matches/${badId}`)
        .set('Authorization', `Bearer ${token}`)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('The `id` is not valid');
        });
    });
  });
});



