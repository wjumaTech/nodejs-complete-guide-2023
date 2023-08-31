const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000; 

// DB models
const User = require('./models/user');

// Routes
const adminRoute = require('./routes/admin');
const shopRoute = require('./routes/shop');

// Body parse
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

// Pointing user to request
app.use((req, res, next) => {
  User.findById("64f0afe5ea3bfbab8adcb467")
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err))
}) 

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
    .render('page404', { path: '/page404' })
});

// Listen and database
mongoose.connect('mongodb://127.0.0.1:27017/eccomerce')
  .then(() => {
    
    // Creating a new user
    User.findOne()
      .then((user) => {
        if(!user) {
          const user = new User({
            name: 'test01',
            email: 'test01@test.com',
            cart: {
              items: []
            }
          });
          return user.save();
        }
      })
      .then((result) => {
        if(result) {
          console.log('Se ha creado un nuevo usuario.');
        }
      })
      .catch((err) => {
        console.log(err);
      })

    app.listen(
      port,
      console.log(`Server running on port ${port}`)
    );
  })
  .catch((err) => {
    console.log(err);
  })