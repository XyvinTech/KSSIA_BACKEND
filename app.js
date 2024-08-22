require("dotenv").config();
const express = require("express");
const cors = require("cors");
const volleyball = require("volleyball");
const clc = require("cli-color");

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
const requirementsRoute = require('./src/routes/requirements');
const { specs, swaggerUi } = require('./src/middlewares/swagger/swagger');
const { app, server } = require("./src/socket/socket.js"); // Import server and io from socket file


app.use(volleyball);

// Define the PORT, NODE_ENV & API version based on environment variable
const { PORT, API_VERSION, NODE_ENV } = process.env;
console.log(PORT, API_VERSION, NODE_ENV);

// Enable Cross-Origin Resource Sharing (CORS) middleware
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Set the base path for API routes
const BASE_PATH = `/api/${API_VERSION}`;

// Import database connection modules
require("./src/helpers/connection");

// Configure routes for the API
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
app.use(`${BASE_PATH}/requirements`, requirementsRoute);
app.use(`${BASE_PATH}/api-docs`, swaggerUi.serve, swaggerUi.setup(specs));

// Define a route for the API root
app.get(BASE_PATH, (req, res) => {
  return responseHandler(
    res,
    200,
    "🛡️ Welcome! All endpoints are fortified. Do you possess the master 🗝️?",
    null
  );
});

app.all('*', (req, res) => {
  return responseHandler(
    res,
    404,
    "🛡️ No API Found",
    null
  );
});

// Start the server and listen on the specified port
server.listen(PORT, () => {
  const portMessage = clc.redBright(`✓ App is running on port: ${PORT}`);
  const envMessage = clc.yellowBright(`✓ Environment: ${NODE_ENV || "development"}`);
  console.log(`${portMessage}\n${envMessage}`);
});
