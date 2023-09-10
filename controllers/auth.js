const bcrypt = require('bcryptjs');
const User = require('../models/user');

exports.getLogin = (req, res) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false
  });
}

exports.postLogin = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ 'email': email })
    .then((user) => {
      if(!user) {
        console.log('El usuario no existe');
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
          console.log('La contrasena es incorrecta')
          res.redirect('/login');
        })
    })
    .catch((err) => {
      console.log(err);
    });
}

exports.getSignup = (req, res) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false
  })
}

exports.postSignup = (req, res) => {
  const { name, lastName, email, password, confirmPassword } = req.body;
  User.findOne({ 'email': email })
    .then((user) => {
      if(user) {
        console.log(`El usuario ya existe, redirigiendo a login para iniciar sesion`);
        return res.redirect('/login');
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
