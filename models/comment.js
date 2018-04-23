'use strict';

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: { type: String }
});


commentSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('Comment', commentSchema);