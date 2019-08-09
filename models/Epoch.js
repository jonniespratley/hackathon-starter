const mongoose = require('mongoose');

const EpochSchema = new mongoose.Schema({
  image: String,
  name: String,
  tracks: Array,
  visible: Boolean,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const Epoch = mongoose.model('Epoch', EpochSchema);

module.exports = Epoch;
