const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000; 

// Routes
const adminRoute = require('./routes/admin');
const shopRoute = require('./routes/shop');

// Body parse
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

// Static files
app.use(express.static(path.join(__dirname, 'public')))

// Use routes
app.use('/admin', adminRoute);
app.use('/', shopRoute);
app.use((req, res, next) => {
  res
    .status(404)
    .sendFile(path.join(__dirname, 'views', 'page404.html'))
});

// Listen and database
mongoose.connect('mongodb://127.0.0.1:27017/eccomerce')
  .then((client) => {
    console.log(client.connections)
    app.listen(
      port,
      console.log(`Server running on port ${port}`)
    );
  })