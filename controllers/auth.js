const path = require('path');
const crypto = require('crypto'); 

const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

const transporter = nodemailer.createTransport(sgTransport({
  auth: {
    api_key: `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`
  }
}))

dotenv.config({
  path: path.join(__dirname, '../', '.env')
})

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
        return transporter.sendMail({
          to: email,
          from: 'wjuma.tech@gmail.com',
          subject: 'Successful account creation',
          html: '<h1>You account was created succesfully.</h1>'
        })
      })
      .catch((err) => {
        console.log(err)
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

exports.getResetPassword = (req, res) => {
  let message = req.flash('error');
  if( message.length > 0 ) {
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/reset-password', {
    path: '/reset-password',
    pageTitle: 'Reset password',
    csrfToken: req.csrfToken(),
    errorMessage: message
  })
}

exports.postResetPassword = (req, res) => {

  crypto.randomBytes(32, (err, buffer) => {

    if(err) {
      console.log(err);
      return res.redirect('/reset-password');
    }

    const token = buffer.toString('hex');

    User.findOne({ 'email': req.body.email })
      .then((user) => {

        if(!user) {
          console.log('Not account with email found to reset password');
          req.flash('error', 'Not account with email found');
          res.redirect('/reset-password')
        }

        user.token = token;

        let now = new Date();
        let time = now.getTime();
        time += 3600 * 1000;
        user.tokenExpires = now.setTime(time);
        return user.save(); 

      })
      .then((resutl) => {

        res.redirect('/');
        return transporter.sendMail({
          to: req.body.email,
          from: 'wjuma.tech@gmail.com',
          subject: 'Password reset',
          html: `
            <p>You requested a password reset</p>
            <p>Clicl this <a href="http://localhost:3000/reset-password/${token}">to set a new password</p>
          `
        })

      })
      .catch((err) => {
        console.log(err);
      })

  })
}

exports.getNewPassword = (req, res) => {


  const { token: resetToken } = req.params;
  const now = new Date();
  const time = now.getTime();

  User.findOne({ token: resetToken, tokenExpires: { $gt: new Date(time) } })
    .then((user) => {
      
      let message = req.flash('error');
      if( message.length > 0 ) {
        message = message[0]
      } else {
        message = null
      }

      if(!user) {
        return res.redirect('/reset-password');
      }

      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'Reset password',
        errorMessage: message,
        csrfToken: req.csrfToken(),
        userId: user._id.toString(),
        resetToken
      })
    })

}

exports.postNewPassword = (req, res) => {

  const token = req.body.token;
  const userId = req.body.userId;
  const newPassword = req.body.password;

  const now = new Date();
  const time = now.getTime();

  let resetUser;

  User.findOne({ token, tokenExpires: { $gt: new Date(time) }, _id: userId })
    .then((user) => {
      if(!user) {
        return res.redirect('/reset-password');
      }
      resetUser = user;
      const salt = bcrypt.genSaltSync(12);
      return bcrypt.hash(newPassword, salt)
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.token = undefined;
      resetUser.tokenExpires = undefined;
      return resetUser.save();
    })
    .then((result) => {
      console.log('Password updated succesfully');
      res.redirect('/login');
    })
    .catch((err) => {
      console.log(err);
    })
  
}
