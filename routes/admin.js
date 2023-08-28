const express = require('express');
const router = express.Router();

const rootDir = require('../util/path');

console.log(rootDir)

router.get('/add-product', (req, res, next) => {
  res.render('add-product');
})

router.post('/products', (req, res) => {
  console.log(req.body);
  res.redirect('/')
})

module.exports = router;