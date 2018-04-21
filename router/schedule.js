'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

// const Schedule = require('../models/schedule');

/* ========== GET/READ ALL ITEMS ========== */
router.get('/schedule', (req, res) => {
  const matches = [
    'Game 1',
    'Game 2',
    'Game 3',
    'Game 4',
    'Game 5',
    'Game 6',
    'Game 7',
    'Game 8',
    'Game 9'
  ];
  
  res.json(matches);
});

module.exports = router;