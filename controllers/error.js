exports.errorPage500 = (req, res) => {
  res.render('page500', {
    path: '/500',
    pageTitle: 'Page 500',
    errorMessage: error.message,
    isAuthenticated: true // FIXME: req.session.isLoggedIn 
  });
}