'use strict';

const mongoose = require('mongoose');

const { DATABASE_URL } = require('../config');
const Match = require('../models/match');
const Comment = require('../models/comment');
const User = require('../models/user');


const seedMatches = require('../db/matches');
const seedComments = require('../db/comments');
const seedUsers = require('../db/users');


mongoose.connect(DATABASE_URL)
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {
    return Promise.all([
      Match.insertMany(seedMatches),
      Comment.insertMany(seedComments),
      User.insertMany(seedUsers)
    ])
      .then(results => console.log('seeding data'));
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });