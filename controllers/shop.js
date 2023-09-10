const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products)=> {
      res.render('shop/product-list', {
        path: '/',
        pageTitle: 'Shop',
        products,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch((err) => {
      console.log(err)
    })
}

exports.getIndex = (req, res, next) => {
  console.log(req.session)
  Product.find()
    .then((products)=> {
      res.render('shop/index', {
        path: '/',
        pageTitle: 'Shop',
        products,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch((err) => {
      console.log(err)
    })
}

exports.getProductDetail = async (req, res) => {
  try {
    const product = await Product.findOne({ 'titleSlug': req.params.titleSlug });
    res.render('shop/product-detail', {
      path: '/product/:titleSlug',
      pageTitle: 'Product detail',
      product,
      isAuthenticated: req.session.isLoggedIn
    })
  } catch (error) {
    console.log(error);
  }
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
    products,
    isAuthenticated: req.session.isLoggedIn
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
      // console.log(result)
      console.log('Se ha agregado un producto al carrito de compras')
      res.redirect('/cart')
    })
    .catch((err) => console.log(err))
}

exports.postCartDeleteProduct = (req, res) => {
  const prodId = req.body.productId;
  req.user.deleteItemFromCart(prodId)
    .then(() => {
      console.log(`El producto con el ID: ${prodId} fue eliminado del carrito de compras`);
      res.redirect('/cart')
    })
}

exports.getOrders = (req, res) => {
  Order.find({ 'user.userId': req.user._id })
    .then((orders) => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Orders',
        orders,
        isAuthenticated: req.session.isLoggedIn
      });
    });
}

exports.postOrder = async (req, res) => {
  const user = await req.user.populate('cart.items.productId');
  const products =  await user.cart.items.map(i => {

    /**
     *  ._doc para que guarde una copia del objeto completo y no solo el _id
     *  del producto, esto para poderlo mostral a la vista mas facilmente.
     **/
    return {
      quantity: i.quantity,
      product: { ...i.productId._doc }
    }
  })
  const order = new Order({
    user: {
      name: req.user.name,
      userId: req.user
    },
    products
  })
  await order.save();
  console.log('Se ha creado una orden de compra.')
  await req.user.clearCart();
  console.log('Cache carrito borrada!.')
  res.redirect('/orders');
}
