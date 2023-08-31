const Product = require('../models/product');

exports.getIndex = (req, res, next) => {

  Product.find()
    .then((products)=> {
      res.render('shop/index', {
        path: '/',
        pageTitle: 'Shop',
        products
      });
    })
    .catch((err) => {
      console.log(err)
    })
}

exports.postCart = (req, res, next) => {

  // Get product id
  const prodId = req.body.productId;

  // Add to cart
}