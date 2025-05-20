const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: String,
  age: Number,
  gender: String,
});

module.exports = mongoose.model('Player', playerSchema);
