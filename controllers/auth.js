const { request, response } = require('express');

exports.getLogin = (req, res) => {

  // const isLoggedIn = req.get('cookie').split(';')[0].split('=')[1];
  console.log(req.session.isLoggedIn)

  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false
  });
}

exports.postLogin = (req=request, res=response) => {
  // res.setHeader('Set-Cookie', 'isLoggedIn=true; HttpOnly');

  req.session.isLoggedIn = true;

  res.redirect('/')
}

exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
}