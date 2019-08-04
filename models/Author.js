const mongoose = require('mongoose');

module.exports = mongoose.model('Author', new mongoose.Schema({
    name: String
}));
