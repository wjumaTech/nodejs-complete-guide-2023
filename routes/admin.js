const express = require('express');
const router = express.Router();

const { body } = require('express-validator');

const isAuth = require('../middlewares/is-auth');

const adminController = require('../controllers/admin');

router.get('/add-product', isAuth, adminController.getAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product', [
	isAuth,
	body('title', 'Title must be a string and leat min 3 characters').isString().isLength({ min: 3 }).trim(),
	body('price', 'The price can be only enters or float values').isFloat(),
	// body('imageUrl', 'Url must be a string URL valid').isURL(),
	body('description', 'Description must be a text and leat min 5 characters').isLength({ min: 5, max: 400 }).trim()

], adminController.postEditProduct);

router.get('/products', isAuth, adminController.getProducts);

router.post('/add-product', [
	isAuth,
	body('title', 'Title must be a string and leat min 3 characters').isString().isLength({ min: 3 }).trim(),
	body('price', 'The price can be only enters or float values').isFloat(),
	// body('imageUrl', 'Url must be a string URL valid').isURL(),
	body('description', 'Description must be a text and leat min 5 characters').isLength({ min: 5, max: 400 }).trim(),	
], adminController.postAddProduct);

router.get('/add-faker-products', adminController.getAddFakerProducts)

router.post( '/add-faker-products', [
	isAuth,
	body('quantity', 'Debes ingresar una cantidad al menos minima de 1').isNumeric().notEmpty()
], adminController.postAddFakerProducts)


router.post('/delete-product', isAuth, adminController.postDeleteProduct);


module.exports = router;
