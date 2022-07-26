// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
// require("dotenv/config");

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);


//-----------------------
// const { Server } = require('socket.io')
// const io = new Server(process.env.SOCKET_PORT,{ 
//     cors: {
//       origin: "http://localhost:3000",
//       methods: ["GET","POST"]
//     }
//   })

// app.set('socketio',io)


//-----------------------

// 👇 Start handling routes here
// Contrary to the views version, all routes are controlled from the routes/index.js
const allRoutes = require("./routes/index.routes");
app.use("/api", allRoutes);
app.use("/auth",require('./routes/auth.routes'))
app.use("/emailConfirmation",require('./routes/emailConfirmation'))
app.use("/product",require('./routes/product.routes'))
app.use("/cart",require('./routes/cart.routes'))
app.use("/user",require('./routes/user.routes'))
//admin
app.use("/admin/auth",require('./routes/adminAuth.route'))
app.use("/order",require('./routes/order.route'))
app.use("/room",require('./routes/room.route'))
app.use("/message",require('./routes/message.route'))
// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
