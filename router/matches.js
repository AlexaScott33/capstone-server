'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const Match = require('../models/match');
const Comment = require('../models/comment');


/* ========== GET/READ ALL ITEMS ========== */
router.get('/matches', (req, res) => {
  const { commentId } = req.query;

  let filter = {};

  if (commentId) {
    filter.comments = commentId;
  }

  Match.find(filter)
    .populate('comments')
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});


/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/matches/:id', (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Match.findById(id)
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});


module.exports = router;