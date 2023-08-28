
const express = require('express');
const router = express.Router();


router.get('/add-product', (req, res, next) => {
  res.send('<form method="POST" action="/admin/products"> <label>Product Name: </label><input type="text" name="title" /> <input type="submit" value="Add product" /></form>')
})

router.post('/products', (req, res) => {
  console.log(req.body);
  res.redirect('/')
})

module.exports = router;