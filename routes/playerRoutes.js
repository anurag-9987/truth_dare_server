const express = require('express');
const router = express.Router();
const Player = require('../models/Player');

router.post('/', async (req, res) => {
  try {
    const newPlayer = new Player(req.body);
    const savedPlayer = await newPlayer.save();
    res.status(201).json(savedPlayer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', async (req, res) => {
  const players = await Player.find();
  res.json(players);
});

module.exports = router;
