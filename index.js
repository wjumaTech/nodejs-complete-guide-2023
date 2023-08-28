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

// Engine template
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs');

// Use routes
app.use('/admin', adminRoute);
app.use('/', shopRoute);
app.use((req, res, next) => {
  res
    .status(404)
    .render('page404')
});

// Listen and database
mongoose.connect('mongodb://127.0.0.1:27017/eccomerce')
  .then(() => {
    console.log(`Database connected!`)
    app.listen(
      port,
      console.log(`Server running on port ${port}`)
    );
  })