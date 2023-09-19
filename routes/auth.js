const express = require('express');
const router = express.Router();

const User = require('../models/user');

const { check, body } = require('express-validator');

const authController = require('../controllers/auth');

router.get('/login', authController.getLogin);

router.post('/login', authController.postLogin);

router.get('/signup', authController.getSignup);

router.post('/signup', [
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom((value, { req }) => {
           return User.findOne({ 'email': value })
            .then((userDoc) => {
                if(userDoc) {
                    return Promise.reject('Email already exist, please pick other one');
                }
            });
        }),
    body('password', 'Please enter password with only numbers and text and least 5 characters.')
        .isLength({ min: 5 })
        .isAlphanumeric(),
    body('confirmPassword')
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Passweord have to match!');
            }
            return true;
        })
], authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset-password', authController.getResetPassword);

router.post('/reset-password', authController.postResetPassword);

router.get('/reset-password/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
