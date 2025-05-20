const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const playerRoutes = require('./routes/playerRoutes');
const questionRoutes = require('./routes/questionRoutes');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

app.use('/api/players', playerRoutes);
app.use('/api/questions', questionRoutes);

app.get('/', (req, res) => res.send('API Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
