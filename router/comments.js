'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const Match = require('../models/match');
const Comment = require('../models/comment');

/* ========== GET/READ ALL ITEMS ========== */
router.get('/matches/:id/comments', (req, res) => {
  const { id } = req.params;

  Match.findOne( { _id: id } )
    .select('comments')
    .populate({
      path: 'comments',
      populate: {
        path: 'userId',
        model: 'User'
      }
    })
    .then(results => {
      res.json(results);
    });
});

/* ========== POST/CREATE NEW ITEMS ========== */
router.post('/matches/:id/comments', (req, res, next) => {
  const { id } = req.params; 
  const { content } = req.body;
  const userId = req.user.id;
  // console.log(userId);

  const newItem = { content, userId };

  /***** Never trust users - validate input *****/
  if (!content) {
    const err = new Error('Missing `content` in request body');
    err.status = 400;
    return next(err);
  }

  Match.findById(id)
    .then((match) => {
      Comment.create(newItem)
        .then((comment) => {
          match.comments.push(comment);
          match.save()
            .then((result) => {
              Match.findById(id)
                .populate({
                  path: 'comments',
                  populate: {
                    path: 'userId',
                    model: 'User'
                  }
                })
                .then(comments => {
                  res.json(comments);
                });
            });
        });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});


module.exports = router;