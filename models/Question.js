const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['truth', 'dare'],
    required: true
  },
  category: {
    type: String,
    enum: ['all', 'friends', 'couple', 'dirty', 'good'],
    default: 'all'
  },
  difficulty: {
    type: Number,
    min: 1,
    max: 5,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Question', questionSchema);