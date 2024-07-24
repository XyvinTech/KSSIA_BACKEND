const mongoose = require("mongoose");
const clc = require("cli-color");

const { MONGO_URL } = process.env;

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log(clc.blueBright("✓ Mongoose connection established..!"));
  })
  .catch((error) => {
    console.log(clc.bgCyanBright(error));
  });