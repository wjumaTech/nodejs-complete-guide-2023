const { request, response } = require('express');

exports.getLogin = (req, res) => {

  const isLoggedIn = req.get('cookie').split(';')[0].split('=')[1];

  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: isLoggedIn
  });
}

exports.postLogin = (req=request, res=response) => {
  res.setHeader('Set-Cookie', 'isLoggedIn=true; HttpOnly');
  res.redirect('/')
}