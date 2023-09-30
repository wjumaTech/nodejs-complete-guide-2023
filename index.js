    const express = require('express');
    const path = require('path');
    const mongoose = require('mongoose');
    const bodyParser = require('body-parser');
    const session = require('express-session');
    const MongoDBStore = require('connect-mongodb-session')(session);
    const cookieParser = require('cookie-parser');
    // const csrf = require('tiny-csrf');
    const flash = require('connect-flash');

    const MONGODB_PASSWORD = '2tCex27Luv5RQK8T';
    const MONGODB_URI = `mongodb+srv://wjumatech:${MONGODB_PASSWORD}@cluster0.ky0pvrm.mongodb.net/compra_me?retryWrites=true`;
    // const MONGODB_URI = 'mongodb://127.0.0.1:27017/ecommerce';

    const STORE = new MongoDBStore({
      uri: MONGODB_URI,
      collection: 'sessions'
    })

    // const csrfProtection = csrf("123456789iamasecret987654321look",  ["POST"]);

    const app = express();
    const port = process.env.PORT || 3000;

    // DB models
    const User = require('./models/user');

    // Routes
    const adminRoute = require('./routes/admin');
    const shopRoute = require('./routes/shop');
    const authRouter = require('./routes/auth');
    const page404Route = require('./routes/page404');
    const { errorPage500 } = require('./controllers/error');

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

    app.use((req, res, next) => {

      if (!req.session.user) {
        // Error handler
        // console.log({
      //   code: 403,
      //   type: 'error',
      //   msg: 'User does\'t exist in the session'
      // });
        return next();
      }

      User.findById(req.session.user._id)
        .then((user) => {

          if (!user) {
            // Error handler
            // console.log({
            //   code: 403,
            //   type: 'error',
            //   msg: 'User dosn\'t exist in the database'
            // });
            throw new Error('User dosn\'t exist in the database');
          }

          // console.log({
          //   code: 302,
          //   type: 'found',
          //   msg: `We have found a mongo user with the ObjectId: ${user._id}, adding to the request and continuing`
          // })
          req.user = user;
          next();
        })
        .catch((err) => {
          console.log(err);
        })
    });

    // app.use(csrfProtection)
    app.use(flash());

    // Could not connect to any servers in your MongoDB

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

    app.use('/500', errorPage500);

    app.use((req, res, next) => {
      res.status(404).render('page404', {
        path: '/page404'
      });
    });

    app.use((error, req, res, next) => {
      res.render('page500', {
        path: '/500',
        pageTitle: 'Page 500',
        errorMessage: error.message,
        isAuthenticated: req.session.isLoggedIn
      });
    });

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