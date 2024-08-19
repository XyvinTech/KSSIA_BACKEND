require("dotenv").config();
const express = require("express");
const cors = require("cors");
const volleyball = require("volleyball");
const clc = require("cli-color");
const http = require("http");
const { Server } = require("socket.io");
const responseHandler = require("./src/helpers/responseHandler");
const userRoute = require("./src/routes/user");
const adminRoute = require("./src/routes/admin");
const productRoute = require("./src/routes/products");
const eventRoute = require("./src/routes/events");
const newsRoute = require("./src/routes/news");
const promotionRoute = require("./src/routes/promotion");
const notificationRoute = require("./src/routes/notification");
const paymentRoute = require("./src/routes/payments");
const filesRoute = require("./src/routes/files");
const chatRoute = require('./src/routes/chats');
const { specs, swaggerUi } = require('./src/middlewares/swagger/swagger');

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = new Server(server); // Initialize socket.io with the server

app.use(volleyball);

//* Define the PORT, NODE_ENV & API version based on environment variable
const { PORT, API_VERSION, NODE_ENV } = process.env;
console.log(PORT, API_VERSION, NODE_ENV)

//* Enable Cross-Origin Resource Sharing (CORS) middleware
app.use(cors());

//* Parse JSON request bodies
app.use(express.json());

//* Set the base path for API routes
const BASE_PATH = `/api/${API_VERSION}`;

//* Import database connection modules
require("./src/helpers/connection");

//* Configure routes for user API

app.use(`${BASE_PATH}/user`, userRoute);
app.use(`${BASE_PATH}/admin`, adminRoute);
app.use(`${BASE_PATH}/products`, productRoute);
app.use(`${BASE_PATH}/events`, eventRoute);
app.use(`${BASE_PATH}/news`, newsRoute);
app.use(`${BASE_PATH}/promotions`, promotionRoute);
app.use(`${BASE_PATH}/notification`, notificationRoute);
app.use(`${BASE_PATH}/payments`, paymentRoute);
app.use(`${BASE_PATH}/files`, filesRoute);
app.use(`${BASE_PATH}/chats`, chatRoute);
app.use(`${BASE_PATH}/api-docs`, swaggerUi.serve, swaggerUi.setup(specs));


//? Define a route for the API root
app.get(BASE_PATH, (req, res) => {
  return responseHandler(
    res,
    200,
    "🛡️ Welcome! All endpoints are fortified. Do you possess the master 🗝️?",
    null
  );
});

app.all('*', (req, res, next) => {
  return responseHandler(
    res,
    404,
    "🛡️ No API Found",
    null
  );
});

//* Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinRoom', ({ chatThreadId }) => {
      socket.join(chatThreadId);
      console.log(`User ${socket.id} joined room ${chatThreadId}`);
  });

  socket.on('sendMessage', (message) => {
      const { chatThreadId } = message;
      io.to(chatThreadId).emit('message', message);
  });

    // Mark messages as seen
    socket.on('markMessagesAsSeen', ({ chatThreadId, userId }) => {
      io.to(chatThreadId).emit('messagesSeen', userId);
  });

    // Notify users of unread notifications
    socket.on('unreadNotifications', ({ userId }) => {
      io.to(userId).emit('unreadNotifications');
  });
  
  // Delete a message
  socket.on('deleteMessage', (messageId) => {
      // Emit deletion to all users in the chat thread
      io.emit('messageDeleted', messageId);
  });


  socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
  });
});

//! Start the server and listen on the specified port from environment variabless
app.listen(PORT, () => {
  const portMessage = clc.redBright(`✓ App is running on port: ${PORT}`);
  const envMessage = clc.yellowBright(
    `✓ Environment: ${NODE_ENV || "development"}`
  );
  console.log(`${portMessage}\n${envMessage}`);
});
