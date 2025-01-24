require("dotenv").config();
const express = require("express");
const cors = require("cors");
const volleyball = require("volleyball");
const clc = require("cli-color");
const admin = require("firebase-admin");
const { serviceAccount } = require("./src/config/firebase");
const responseHandler = require("./src/helpers/responseHandler");
const userRoute = require("./src/routes/user");
const adminRoute = require("./src/routes/admin");
const roleRoute = require("./src/routes/role");
const productRoute = require("./src/routes/products");
const eventRoute = require("./src/routes/events");
const newsRoute = require("./src/routes/news");
const promotionRoute = require("./src/routes/promotion");
const notificationRoute = require("./src/routes/notification");
const paymentRoute = require("./src/routes/payments");
const filesRoute = require("./src/routes/files");
const chatRoute = require('./src/routes/chats');
const requirementsRoute = require('./src/routes/requirements');
const authRoute = require('./src/routes/auth');
const dashboardRoute = require('./src/routes/dashboard');
const { specs, swaggerUi } = require('./src/middlewares/swagger/swagger');
const { app, server } = require("./src/socket/socket.js"); //! Import server and io from socket file
const reportRoute = require("./src/routes/report");

app.use(volleyball);

// Define the PORT, NODE_ENV & API version based on environment variable
const { PORT, API_VERSION, NODE_ENV } = process.env;

// Enable Cross-Origin Resource Sharing (CORS) middleware
app.use(cors());

// Increase the limit for JSON requests
app.use(express.json({ limit: '200mb' })); // Set the limit to 50 MB

// Increase the limit for URL-encoded requests
app.use(express.urlencoded({ limit: '200mb', extended: true }));

// Set the base path for API routes
const BASE_PATH = `/api/${API_VERSION}`;

// Start the cron job
require("./src/jobs"); 

// Import database connection modules
require("./src/helpers/connection");

//* Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.BUCKET_URL,
});

// Configure routes for the API
app.use(`${BASE_PATH}/user`, userRoute);
app.use(`${BASE_PATH}/admin`, adminRoute);
app.use(`${BASE_PATH}/auth`, authRoute);
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
app.use(`${BASE_PATH}/report`, reportRoute);
app.use(`${BASE_PATH}/role`, roleRoute);
app.use(`${BASE_PATH}/dashboard`, dashboardRoute);

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
