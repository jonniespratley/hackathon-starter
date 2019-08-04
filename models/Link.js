const mongoose = require('mongoose');

module.exports = mongoose.model('Link',
  new mongoose.Schema({
    url: String,
    description: String
  }));
