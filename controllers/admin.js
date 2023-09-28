const { validationResult } = require('express-validator');
const Product = require('../models/product');
const { slugTextConverter } = require('../util/helpers');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null
  });
}

exports.postAddProduct = (req, res) => {

  const { title, price, imageUrl, description } = req.body;
  const titleSlug = slugTextConverter(title);

  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    return res.render('admin/edit-product', {
      pageTitle: 'Add product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title,
        price,
        imageUrl,
        description
      },
      errorMessage: errors.array()[0].msg
    });
  }

  const product = new Product({
    title,
    titleSlug,
    price,
    imageUrl,
    description,
    userId: req.user
  })
  product.save()
    .then((productSaved) => {
      console.log('Created product!');
      return productSaved;
    })
    .then((result) => {
      res.redirect('/');
    })
    .catch((err) => {
      console.log(err);
    });
}

exports.getEditProduct = (req, res, next) => {
  const editMode = Boolean(req.query.edit);
  if(!editMode) {
    return res.redirect('/')
  }
  const prodId = req.params.productId;
  Product.findOne({ _id: prodId})
    .then((product) => {
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        hasError: false,
        product: product,
        errorMessage: null
      });
    });
}

exports.postEditProduct = (req, res, next) => {
  const { title, price, imageUrl, description, productId:prodId } = req.body;

  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    return res.render('admin/edit-product', {
      pageTitle: 'Add product',
      path: '/admin/add-product',
      editing: true,
      hasError: true,
      product: {
        title,
        price,
        imageUrl,
        description,
        _id: prodId
      },
      errorMessage: errors.array()[0].msg
    });
  }

  Product.findById(prodId)
    .then((product) => {

      // Validation and protected routes
      if(product.userId.toString() !== req.user._id.toString()) {
        console.log('Actualizacion de producto denegada')
        return res.redirect('/');
      }

      product.title = title;
      product.price = price;
      product.imageUrl = imageUrl;
      product.description = description;
      return product.save()
        .then(result => {
          console.log('UPDATED PRODUCT!');
          res.redirect('/admin/products');
        })
    })
    .catch(err => console.log(err));
}

exports.getProducts = (req, res, next) => {
  Product.find({ 'userId': req.user._id })
    .populate('userId')
    .then((products) => {
      res.render('admin/products', {
        pageTitle: 'Admin Products',
        path: '/admin/products',
        products
      });
    })
    .catch((err) => console.log(err));
}

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteOne({ '_id': prodId, 'userId': req.user._id})
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
};
