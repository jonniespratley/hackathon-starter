const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  baseUri: String,
  main: String,
  error: String,
  errorChromeless: String,
  displayName: String,
  demoLink: String,
  description: String,
  createdAt: Date,
  updatedAt: Date,
  tenant: String
});
module.exports = mongoose.model('Theme', schema);
