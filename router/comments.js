'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const Comment = require('../models/comment');


/* ========== GET/READ ALL ITEMS ========== */
router.get('/comments', (req, res) => {
  console.log('!!!!!', req.body);
  Comment.find()
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

/* ========== POST/CREATE NEW ITEMS ========== */
router.post('/comments', (req, res) => {
  const { content } = req.body;
  const newItem = { content };

  /***** Never trust users - validate input *****/
  if (!content) {
    const err = new Error('Missing `content` in request body');
    err.status = 400;
    console.error(err);
  }

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

  
    


module.exports = router;