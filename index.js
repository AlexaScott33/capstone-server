'use strict';

require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');

const localStrategy = require('./passport/local');
const { PORT, CLIENT_ORIGIN } = require('./config');
const { dbConnect } = require('./db-mongoose');

const jwtStrategy = require('./passport/jwt');

const matchesRouter = require('./router/matches');
const commentsRouter = require('./router/comments');
const usersRouter = require('./router/users');
const authRouter = require('./router/auth');


// const predictionsRouter = require('./router/predictions');

const app = express();
app.use(bodyParser.json());

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

//Configure Passport to utilize the strategy
passport.use(localStrategy);
passport.use(jwtStrategy);

//Mount router
app.use('/api', usersRouter);
app.use('/api', authRouter);

// Endpoints below this require a valid JWT
const jwtAuth = passport.authenticate('jwt', { session: false, failWithError :true});

app.use('/api', jwtAuth, commentsRouter);
app.use('/api', jwtAuth, matchesRouter);
// app.use('/api', predictionsRouter);

// Catch-all 404
// app.use(function (req, res, next) {
//   const err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });


function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = { app };
