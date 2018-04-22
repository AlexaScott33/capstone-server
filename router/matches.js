'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const Match = require('../models/match');

/* ========== GET/READ ALL ITEMS ========== */
router.get('/matches', (req, res) => {
  Match.find()
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/matches/:id', (req, res) => {
  const { id } = req.params;

  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    console.error(err);
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