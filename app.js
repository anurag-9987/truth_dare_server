const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();

const playerRoutes = require("./routes/playerRoutes");
const questionRoutes = require("./routes/questionRoutes");
const Question = require("./models/Question");

const app = express();
const server = http.createServer(app);

// Turn management variables
let playersOrder = [];
let currentTurnIndex = 0;

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

app.use("/api/players", playerRoutes);
app.use("/api/questions", questionRoutes);
app.get("/", (req, res) => res.send("API Running"));

io.on("connection", (socket) => {
  console.log(`New connection: ${socket.id}`);

  // Player joining handler
   socket.on("join", (player) => {
    const newPlayer = {
      ...player,
      socketId: socket.id,
      isTurn: false
    };

    // Add to players order if new player
    if (!playersOrder.some(p => p.socketId === socket.id)) {
      playersOrder.push(newPlayer);
      
      // Set first player's turn
      if (playersOrder.length === 1) {
        playersOrder[0].isTurn = true;
        currentTurnIndex = 0;
      }
    }

    console.log(`Player joined: ${player.name} (${socket.id})`);
    io.emit("updatePlayers", playersOrder);
    io.emit("turnUpdate", playersOrder[currentTurnIndex]?.socketId);
  });

  // Chat message handler
  socket.on("chatMessage", ({ playerName, message }) => {
    io.emit("newMessage", { playerName, content: message });
  });

  // Question handler
  socket.on("choose", async ({ type, category }) => {
    try {
      const questions = await Question.aggregate([
        { $match: { type, category } },
        { $sample: { size: 1 } },
      ]);

      if (questions.length > 0) {
        io.emit("newMessage", { 
          playerName: "Question", 
          content: `${type.toUpperCase()}: ${questions[0].text} (${category})` 
        });
        socket.emit("newQuestion", { choice: type, question: questions[0].text });
      } else {
        socket.emit("error", `No ${type} questions in ${category}`);
      }
    } catch (err) {
      console.error("Question error:", err);
      socket.emit("error", "Question failed");
    }
  });

  // Turn progression
   const advanceTurn = () => {
    currentTurnIndex = (currentTurnIndex + 1) % playersOrder.length;
    playersOrder.forEach((p, index) => {
      p.isTurn = index === currentTurnIndex;
    });
    io.emit("turnUpdate", playersOrder[currentTurnIndex]?.socketId);
    io.emit("updatePlayers", playersOrder);
  };

  // Answer submission
 socket.on("done", ({ answer, playerName }) => {
  // Broadcast the answer to all players
  io.emit("newMessage", { 
    playerName, 
    content: answer 
  });
  advanceTurn();
});

  // Disconnection handler
socket.on("disconnect", () => {
    playersOrder = playersOrder.filter(p => p.socketId !== socket.id);
    
    if (playersOrder.length > 0) {
      currentTurnIndex = currentTurnIndex % playersOrder.length;
      advanceTurn();
    }
    
    io.emit("updatePlayers", playersOrder);
  });

  // Error handling
  socket.on("error", (err) => {
    console.error(`Socket error (${socket.id}):`, err);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));