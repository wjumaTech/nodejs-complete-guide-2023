
const express = require('express');
const router = express.Router();


router.get('/', (req, res, next) => {
  res.send('<h1>Hello from Express!</h1> <a href="/admin/add-product">Add product</a>')
})

module.exports = router;