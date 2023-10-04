    const express = require('express');
    const path = require('path');
    const mongoose = require('mongoose');
    const bodyParser = require('body-parser');
    const session = require('express-session');
    const MongoDBStore = require('connect-mongodb-session')(session);
    const cookieParser = require('cookie-parser');
    // const csrf = require('tiny-csrf');
    const flash = require('connect-flash');
    const multer = require('multer');
    const { v4: uuidv4 } = require('uuid');

    const MONGODB_PASSWORD = 'M5Z98updvhtBjbr2';
    const MONGODB_URI = `mongodb+srv://wjumatech:${MONGODB_PASSWORD}@cluster0.ky0pvrm.mongodb.net/compra_me?retryWrites=true`;
    // const MONGODB_URI = 'mongodb://127.0.0.1:27017/ecommerce';

    const STORE = new MongoDBStore({
      uri: MONGODB_URI,
      collection: 'sessions'
    });
    const FILE_STORAGE = multer.diskStorage({
      destination: (req, file, callback) => {
        callback(null, 'images');
      },
      filename: (req, file, callback) => {
        callback(null, uuidv4() + '-' + file.originalname);
      }
    });
    const FILE_FILTER = (req, file, callback) => {
      if( file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' ) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    }

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
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(multer({ storage: FILE_STORAGE, fileFilter: FILE_FILTER }).single('image'));

    // Static files
    app.use("/public", express.static(path.join(__dirname, 'public')))
    app.use("/images", express.static(path.join(__dirname, 'images')))

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
        return next();
      }
      User.findById(req.session.user._id)
        .then((user) => {
          if (!user) {
            throw new Error('User dosn\'t exist in the database');
          }
          req.user = user;
          next();
        })
        .catch((err) => {
          console.log(err);
        });
    });

    app.use(flash());
    app.use((req, res, next) => {
      res.locals.isAuthenticated = req.session.isLoggedIn;
      next();
    })

    app.set('views', path.join(__dirname, 'views'))
    app.set('view engine', 'ejs');
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
        isAuthenticated: true // FIXME: req.session.isLoggedIn  
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