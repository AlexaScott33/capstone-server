'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const Match = require('../models/match');
const Comment = require('../models/comment');

//get all comments that belong to specific matchId
/* ========== GET/READ ALL ITEMS ========== */
router.get('/matches/:id/comments', (req, res) => {
  const { id } = req.params;

  Match.find( { _id: id } )
    .then((match) => {
      Comment.find()
        .where('_id')
        .in(match[0].comments)
        .then(results => {
          res.json(results);
        });
    });
});

//create new comment for specific matchId by specific userId
/* ========== POST/CREATE NEW ITEMS ========== */
router.post('/matches/:id/comments', (req, res) => {
  const { content, userId} = req.body;

  const { id  } = req.params; 

  //TODO: set to req.user.id when login is implemented
  // const userId = '5ade66a7fc0671102fec3a0c';
  // console.log('!!!', req.user.id);

  // const { content, userId } = req.body;
  const newItem = { content, userId };

  /***** Never trust users - validate input *****/
  if (!content) {
    const err = new Error('Missing `content` in request body');
    err.status = 400;
    console.error(err);
  }

  //match findBYID and update --> find ID
  Match.findById(id)
    .then((match) => {
      Comment.save(newItem)
        .then((comment) => {
          Match.findByIdAndUpdate(id, {comment: match.comments.push(comment)} )
          .then((match) => {

          })
          Comment.find()
            .then(results => {
              res.json(results);
            });
        })
        .catch(err => {
          console.error(err);
          res.status(500).json({message: 'Internal server error'});
        });
    });
});


module.exports = router;