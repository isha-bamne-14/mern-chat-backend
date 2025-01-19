const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const mongoose = require("mongoose");
const http = require("http");
const socketio = require("socket.io");
const userRouter = require("./routes/userRoutes");
const socketIo = require("./socket");
const groupRouter = require("./routes/groupRoutes");
const messageRouter = require("./routes/messageRoutes");

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
}); //socketio

//middlewares
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log(error);
  });

socketIo(io);

app.use("/api/users", userRouter);
app.use("/api/groups", groupRouter);
app.use("/api/messages", messageRouter);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("server is running on port", PORT);
});
