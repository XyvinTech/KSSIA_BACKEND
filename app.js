require("dotenv").config();
const express = require("express");
const cors = require("cors");
const volleyball = require("volleyball");
const clc = require("cli-color");
const responseHandler = require("./src/helpers/responseHandler");
const userRoute = require("./src/routes/user");

const app = express();
app.use(volleyball);
//* Define the PORT, NODE_ENV & API version based on environment variable
const { PORT, API_VERSION, NODE_ENV } = process.env;

//* Enable Cross-Origin Resource Sharing (CORS) middleware
app.use(cors());

//* Parse JSON request bodies
app.use(express.json());

//* Set the base path for API routes
const BASE_PATH = `/api/${API_VERSION}`;

//* Import database connection module
require("./src/helpers/connection");

//* Configure routes for user API
app.use(`${BASE_PATH}/user`, userRoute);
// app.use(`${BASE_PATH}/role`, rolesRouter);
// app.use(`${BASE_PATH}/product`, productsRouter);

//? Define a route for the API root
app.get(BASE_PATH, (req, res) => {
  return responseHandler(
    res,
    200,
    "🛡️ Welcome! All endpoints are fortified. Do you possess the master 🗝️?",
    null
  );
});

//! Start the server and listen on the specified port from environment variable
app.listen(PORT, () => {
  const portMessage = clc.redBright(`✓ App is running on port: ${PORT}`);
  const envMessage = clc.yellowBright(
    `✓ Environment: ${NODE_ENV || "development"}`
  );
  console.log(`${portMessage}\n${envMessage}`);
});
