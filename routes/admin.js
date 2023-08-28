const express = require('express');
const path = require('path');
const router = express.Router();

const rootDir = require('../util/path');

console.log(rootDir)

router.get('/add-product', (req, res, next) => {
  res.sendFile(path.join(rootDir, 'views', 'add-product.html'))
})

router.post('/products', (req, res) => {
  console.log(req.body);
  res.redirect('/')
})

module.exports = router;