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

exports.getCart = async (req, res) => {

  /**
   * In this case we use async/await becouse mongoose migrated populate
   * to this new paradig.
   */
  const cartUserProducts = await req.user.populate('cart.items.productId');
  const products =  await cartUserProducts.cart.items;

  res.render('shop/cart', {
    path: '/cart',
    pageTitle: 'Cart',
    products
  });

}

exports.postCart = (req, res, next) => {

  const prodId = req.body.productId;

  // Get Find product for add to cart
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log('Se ha agregado un producto al carrito de compras')
      res.redirect('/cart')
    })
    .catch((err) => console.log(err))
}