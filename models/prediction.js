'use strict';

const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  home: { type: Boolean, default: false },
  away: { type: Boolean, default: false },
  tie: { type: Boolean, default: false }
});


predictionSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('Prediction', predictionSchema);