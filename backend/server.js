const express = require("express");
const dotenv = require("dotenv").config();
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const PORT = process.env.PORT || 5000;

//Connect to mongodb and Start server

mongoose.connect(process.env.MONGODB_URI).then(() => {
  app.listen(3000, console.log(`Server listening at port ${PORT}`));
});
