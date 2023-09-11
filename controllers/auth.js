const bcrypt = require('bcryptjs');
const User = require('../models/user');

exports.getLogin = (req, res) => {

  let message = req.flash('error');
  if( message.length > 0 ) {
    message = message[0]
  } else {
    message = null
  }

  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    csrfToken: req.csrfToken(),
    errorMessage: message
  });
}

exports.postLogin = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ 'email': email })
    .then((user) => {
      if(!user) {
        console.log('El usuario no existe');
        req.flash('error', 'Username does not exist');
        return res.redirect('/login');
      }
      bcrypt.compare(password, user.password)
        .then((doMatch) => {
          if(doMatch) {
            req.session.user = user;
            req.session.isLoggedIn = true;
            return req.session.save((err) => {
              if(err) { console.log(err); }
              res.redirect('/')
            });
          }
          console.log('La contrasena es incorrecta');
          req.flash('error', 'Password is incorrect');
          res.redirect('/login');
        })
    })
    .catch((err) => {
      console.log(err);
    });
}

exports.getSignup = (req, res) => {
  let message = req.flash('error');
  if( message.length > 0 ) {
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    csrfToken: req.csrfToken(),
    errorMessage: message
  })
}

exports.postSignup = (req, res) => {
  const { name, lastName, email, password, confirmPassword } = req.body;
  User.findOne({ 'email': email })
    .then((user) => {
      if(user) {
        console.log(`El usuario ya existe, redirigiendo a login para iniciar sesion`);
        req.flash('error', 'Email already exist, please pick other one');
        return res.redirect('/signup');
      }
      const salt = bcrypt.genSaltSync(12);
      return bcrypt.hash(password, salt)
      .then((hashedPassword) => {
        const createUser = new User({ name, lastName, email, password: hashedPassword, cart: {items: []} });
        return createUser.save();
      })
      .then((userDoc) => {
        res.status(201).redirect('/login');
      });
    })
    .catch((err) => {
      console.log(err);
    });
}


exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
}
