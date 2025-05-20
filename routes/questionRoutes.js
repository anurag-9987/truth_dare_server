const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// Add question
router.post('/', async (req, res) => {
  try {
    const question = new Question(req.body);
    const saved = await question.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get questions by filter (optional)
router.get('/', async (req, res) => {
  const { type, category } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (category) filter.category = category;
  const questions = await Question.find(filter);
  res.json(questions);
});

module.exports = router;
