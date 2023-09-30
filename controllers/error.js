exports.getError505 = (error, req, res, next) => {
  res
    .status(500)
    .render('page500', { 
      path: '/page500', 
      pageTitle: 'Page500',
      errorMessage: null
    });
}

exports.getError404 = (req, res, next) => {
  res
    .status(404)
    .render('page404', { 
      path: '/page404', 
      pageTitle: 'Page404'
    });
}