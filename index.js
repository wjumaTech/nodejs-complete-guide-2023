const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const MONGODB_URI = 'mongodb://127.0.0.1:27017/avispa';

const STORE = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
})

const app = express();
const port = process.env.PORT || 3000; 

// DB models
const User = require('./models/user');

// Routes
const adminRoute = require('./routes/admin');
const shopRoute = require('./routes/shop');
const authRouter = require('./routes/auth');

// Body parse
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.use(session({ 
  secret: 'My secret', 
  resave: false, 
  saveUninitialized: true,
  store: STORE,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  }
}));

// Pointing user to request
app.use((req, res, next) => {
  User.findById("64fa0dce02ce4a922788f0c1")
    .then((user) => {
      req.session.user = user;
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
app.use(shopRoute);
app.use(authRouter);


app.use((req, res, next) => {
  res
    .status(404)
    .render('page404', { path: '/page404' })
});

// Listen and database
mongoose.connect(`${MONGODB_URI}`)
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