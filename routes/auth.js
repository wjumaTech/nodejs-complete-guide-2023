const express = require('express');
const router = express.Router();

const { check, body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

router.get('/login', authController.getLogin);

router.post('/login', authController.postLogin);

router.get('/signup', authController.getSignup);

router.post('/signup', [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, {req}) => {
        return User.findOne({ 'email': value })
          .then((emailDoc) => {
            if(emailDoc) {
              return Promise.reject('Email already exist, please pick other one');
            }
          })
      }),
    check('password', 'Por favor ingresa una contraseña valida con un minimo de 6 caracteres y alfanumerica.')
      .isLength({ min: 6 })
], authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset-password', authController.getResetPassword);

router.post('/reset-password', authController.postResetPassword);

router.get('/reset-password/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
