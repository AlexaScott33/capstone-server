'use strict';

const mongoose = require('mongoose');


const predictionSchema = new mongoose.Schema({
  prediction: { type: String, enum: ['home', 'away', 'tie']}
});


predictionSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});


module.exports = mongoose.model('Prediction', predictionSchema);