const express = require('express');
const router = express.Router();

const { body } = require('express-validator');

const isAuth = require('../middlewares/is-auth');

const adminController = require('../controllers/admin');

router.get('/add-product', isAuth, adminController.getAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product', [

	body('title').isAlphanumeric().isLength({ min: 3 }).trim(),
	body('price').isFloat(),
	body('imageUrl').isURL(),
	body('description').isLength({ min: 5, max: 400 }).trim()

], isAuth, adminController.postEditProduct);

router.get('/products', isAuth, adminController.getProducts);

router.post('/add-product', isAuth, adminController.postAddProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);


module.exports = router;
