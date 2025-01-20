const socketIo = (io) => {
  console.log("Inside server socket");

  //store the connected users with their room information using socket.id as their key
  const connectedUsers = new Map();
  io.on("connection", (socket) => {
    //Get user from authentication
    const user = socket.handshake.auth.user; // In the client side we attach the user object to the socket handshake
    console.log("User connected", user?.username);

    //! START: Join room Handler
    socket.on("join room", (groupId) => {
      // Add socket to the specified room
      if (!connectedUsers.has(socket.id)) {
        console.log(`${user.username} has joined the room : ${groupId}`);
        socket.join(groupId);
        // Add user to the connectedUsers map
        connectedUsers.set(socket.id, { user, room: groupId });
        // Get a list of all users currently in the room
        const usersInRoom = Array.from(connectedUsers.values())
          .filter((obj) => obj.room === groupId)
          .map((obj) => obj.user); // Array of user object
        io.in(groupId).emit("users in room", usersInRoom); // broadcasts to every socket in the room
        // Broadcast to the room that a new user has joined
        // broadcasts to every socket in the room except the current socket
        socket.to(groupId).emit("notification", {
          type: "USER_JOINED",
          message: `${user.username} has joined the room`,
          user,
        });
      }
    });
    //! END: Join room Handler

    //! START: Leave room Handler
    socket.on("leave room", (groupId) => {
      // Remove socket from the specified room
      if (connectedUsers.has(socket.id)) {
        console.log(`${user.username} has left the room : ${groupId}`);
        socket.leave(groupId);
        // Remove user from the connectedUsers map
        if (connectedUsers.has(socket.id)) {
          connectedUsers.delete(socket.id);
          socket.to(groupId).emit("user left", user?._id);
        }
      }
    });
    //! END: Leave room Handler

    //!START: New message Handler
    socket.on("new message", (message) => {
      socket.to(message.groupId).emit("message received", message);
    });
    //!END: New message Handler

    //!START: Disconnect Handler
    socket.on("disconnect", (reason) => {
      console.log(`${user.username} has disconnected`);
      console.log(`Because: ${reason}`);

      if (connectedUsers.has(socket.id)) {
        // Get user's room info before removing
        const userData = connectedUsers.get(socket.id);
        socket.to(userData.room).emit("user left", userData.user._id);
        connectedUsers.delete(socket.id);
      }
    });
    //!END: Disconnect Handler

    //!START: Typing Indicator
    socket.on("typing", ({ groupId, username }) => {
      socket.to(groupId).emit("user typing", {
        username,
      });
    });

    socket.on("stop typing", ({ groupId }) => {
      socket.to(groupId).emit("user stopped typing", user?.username);
    });
    //!END: Typing Indicator
  });
};

module.exports = socketIo;
