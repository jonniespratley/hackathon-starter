const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  id: String,
  uri: String,
  host: String,
  path: String,
  template: String,
  location: String,
  default: Boolean,
  navService: String,
  capabilities: Array,
  order: Number,
  createdAt: Date,
  updatedAt: Date,
  icon: String,
  label: String,
  items: Array,
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant'
  }
});
module.exports = mongoose.model('App', schema);
