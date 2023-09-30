const express = require('express');
const router = express.Router();

const isAuth = require('../middlewares/is-auth');

const shopController = require('../controllers/shop');

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:titleSlug', shopController.getProductDetail);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postCart);

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

router.get('/orders', isAuth, shopController.getOrders);

router.post('/create-order', isAuth, shopController.postOrder);

module.exports = router;
