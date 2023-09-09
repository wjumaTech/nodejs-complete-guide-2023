const { request, response } = require('express');
const User = require('../models/user');

exports.getLogin = (req, res) => {
  // const isLoggedIn = req.get('cookie').split(';')[0].split('=')[1];
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false
  });
}

exports.postLogin = async (req=request, res=response) => {
 
  /**
   * Simulando un inicio de session con autenticacion de usuario a lo duro
   * esto hasta que consultemos tomando los datos de un formulario.
   */
  const user = await User.findById("64fa0dce02ce4a922788f0c1");
  req.session.user = user;
  req.session.isLoggedIn = true;

  /**
   * Guardar la session puede tardar, por lo que la redireccion la haremos 
   * una vez session termine el proceso
   */
  req.session.save((err) => {
    if(err) {
      console.log(err);
    }
    res.redirect('/')
  });
}

exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
}