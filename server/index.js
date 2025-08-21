const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const convRoutes = require("./routes/conversations");
const { verifySocket } = require("./middleware/auth");

require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/conversations", convRoutes);

// MongoDB connect
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log("MongoDB connected"))
.catch(err => console.error(err));

// Socket.IO
let onlineUsers = {};

io.use(verifySocket);

io.on("connection", (socket) => {
  const userId = socket.user.id;
  onlineUsers[userId] = socket.id;

  io.emit("user:online", { userId });

  socket.on("message:send", async (msg) => {
    io.to(onlineUsers[msg.to]).emit("message:new", msg);
  });

  socket.on("typing:start", ({ to }) => {
    io.to(onlineUsers[to]).emit("typing:start", { from: userId });
  });

  socket.on("typing:stop", ({ to }) => {
    io.to(onlineUsers[to]).emit("typing:stop", { from: userId });
  });

  socket.on("message:read", ({ to, messageId }) => {
    io.to(onlineUsers[to]).emit("message:read", { messageId });
  });

  socket.on("disconnect", () => {
    delete onlineUsers[userId];
    io.emit("user:offline", { userId });
  });
});

server.listen(process.env.PORT || 5000, () =>
  console.log("Server running...")
);
