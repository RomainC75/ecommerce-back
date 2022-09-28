const app = require("./app");

// ℹ️ Sets the PORT for our app to have access to it. If no env has been set, we hard code it to 3000
const PORT = process.env.PORT || 5005;

const socket = require('./socket/index')
socket()

const server = app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`);
});

// const io = require('socket.io')(server)
// const { Server } = require('socket.io')
// const http = require("http");
// const httpServer = http.createServer(app);
// const io = require("socket.io")(httpServer, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
//   transports: "websocket",
// });
// app.set('socketio', io)