'use strict';

const mongoose = require('mongoose');


const matchSchema = new mongoose.Schema({
  date: { type: String },
  home: { type: String },
  away: { type: String },
  score: { type: String },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});


matchSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});


module.exports = mongoose.model('Match', matchSchema);

