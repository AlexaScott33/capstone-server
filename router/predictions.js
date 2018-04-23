'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const Prediction = require('../models/prediction');

/* ========== GET/READ ALL ITEMS ========== */
router.get('/predictions', (req, res) => {
  Prediction.find()
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

router.post('/predictions', (req, res) => {
//if not home away por tie throw error --> otherwise accept and add to db 
  const { prediction } = req.body;
  const newItem = { prediction };

  /***** Never trust users - validate input *****/
  // if (!prediction) {
  //   const err = new Error('Missing `prediction` in request body');
  //   err.status = 400;
  //   console.error(err);
  // }

  // if (prediction !== 'home' || prediction !== 'away' || prediction !== 'tie') {
  //   const err = new Error('Must enter in valid prediction');
  //   err.status = 400;
  //   console.error(err);
  // }

  Prediction.create(newItem)
    .then(() => {
      Prediction.find()
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

