const mongoose = require('mongoose');

module.exports = mongoose.model('Theme', new mongoose.Schema({    
  "baseUri":String,
  "main": String,
  "error": String,
  "errorChromeless": String,
  "displayName": String,
  "demoLink": String,
  "description": String,
  createdAt: Date,
  updatedAt: Date,
  tenant: String
}));
