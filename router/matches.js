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

module.exports = router;