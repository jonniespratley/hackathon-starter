const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  uri: String,
  baseUri: String,
  main: String,
  error: String,
  errorChromeless: String,
  displayName: String,
  demoLink: String,
  description: String,
  options: Object,
  createdAt: Date,
  updatedAt: Date,
  tenant_id: String,
  is_internal: Boolean,
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant'
  }
});
module.exports = mongoose.model('Theme', schema);
