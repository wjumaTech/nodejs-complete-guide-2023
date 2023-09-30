const express = require('express');
const router = express.Router();

router.get((req, res, next) => {
  res
    .status(404)
    .render('page404', { 
      path: '/page404', 
      pageTitle: 'Page404', 
      csrfToken: req.csrfToken() 
    });
});

module.exports = router;