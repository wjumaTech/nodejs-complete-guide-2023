const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const cookieParser = require('cookie-parser');
const csrf = require('tiny-csrf');
const flash = require('connect-flash');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/avispa';

const STORE = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
})
const csrfProtection = csrf("123456789iamasecret987654321look",  ["POST"]);

const app = express();
const port = process.env.PORT || 3000;

// DB models
const User = require('./models/user');

// Routes
const adminRoute = require('./routes/admin');
const shopRoute = require('./routes/shop');
const authRouter = require('./routes/auth');
const page404Route = require('./routes/page404');

// Body parse
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

// Static files
app.use(express.static(path.join(__dirname, 'public')))

// Cookie parser
app.use(cookieParser("My secret"));

app.use(session({
  secret: 'My secret',
  resave: false,
  saveUninitialized: true,
  store: STORE,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  }
}));
app.use(csrfProtection)
app.use(flash());

app.use((req, res, next) => {
  if( !req.session.user ) {
    return next();
  }

  User.findById( req.session.user._id )
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err))
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
})

// Engine template
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs');

// Use routes
app.use('/admin', adminRoute);
app.use(shopRoute);
app.use(authRouter);
app.use(page404Route);

// Listen and database
mongoose.connect(`${MONGODB_URI}`)
  .then(() => {
    app.listen(
      port,
      console.log(`Server running on port ${port}`)
    );

  })
  .catch((err) => {
    console.log(err);
  })
