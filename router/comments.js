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
  // console.log('!!!', id);

  //get all comment IDs --> query
  Match.find( { _id: id } )
    .then((match) => {
      Comment.find()
        .where('_id')
        .in(match[0].comments)
        .then(results => {
          res.json(results);
        });
    });
  







  // Match.find( { _id: id } )
  //   .then((match) => {
  //     match[0].comments.forEach(comment => {
  //       Comment.find({ _id: comment })
  //         .then(result => {
  //           console.log(result);
  //           console.log(comment, results);
  //           results[comment] = result[0];
  //         });
  //     });
  //     res.json(results);
  //   })
  //   .catch(err => {
  //     console.error(err);
  //     res.status(500).json({message: 'Internal server error'});
  //   });
});


//create new comment for specific matchId by specific userId
/* ========== POST/CREATE NEW ITEMS ========== */
router.post('/matches/:id/comments', (req, res) => {
  const { content } = req.body;

  // const { content, userId } = req.body;
  const { matchId } = req.params;
  const newItem = { content };

  /***** Never trust users - validate input *****/
  if (!content) {
    const err = new Error('Missing `content` in request body');
    err.status = 400;
    console.error(err);
  }
  //match findBYID and update --> find ID
  Match.findByIdAndUpdate(matchId)
    .then(() => {
      Comment.create(newItem)
        .then(() => {
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