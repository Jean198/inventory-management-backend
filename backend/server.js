const express = require('express');
const dotenv = require('dotenv').config();
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const userRoute = require('./routes/userRoute');
const productRoute = require('./routes/productRoute');
const errorHandler = require('../backend/middlewares/errorMiddleware');
mongoose.set('strictQuery', true);
const cookieParser = require('cookie-parser');
var expressBusboy = require('express-busboy'); //This helps to send form-data from postman!!!!!!!!!!!!!!!!!!!

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors());
expressBusboy.extend(app); //This helps to send form-data from postman!!!!!!!!!!!!!!!!!!!

//Routes middleware
app.use('/api/users', userRoute);
app.use('/api/products', productRoute);

app.get('/', (req, res) => {
  res.send('Homepage');
});

//Error middleware
app.use(errorHandler);

//Connect to mongodb and Start server
mongoose.connect(process.env.MONGODB_URI).then(() => {
  app.listen(PORT, console.log(`Server listening at port ${PORT}`));
});
