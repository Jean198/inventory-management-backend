const express = require("express");
const dotenv = require("dotenv").config();
const app = express();
const mongoose = require("mongoose");
const bodyParser=require('body-parser')
const cors = require("cors");
const PORT = process.env.PORT || 5000;
mongoose.set('strictQuery', true)

//Middlewares

app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(bodyParser.json())


app.get("/", (req,res)=>{
  res.send("Homepage")
})

//Connect to mongodb and Start server

mongoose.connect(process.env.MONGODB_URI).then(() => {
  app.listen(PORT, console.log(`Server listening at port ${PORT}`));
});
