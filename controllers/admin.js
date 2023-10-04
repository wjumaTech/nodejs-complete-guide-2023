const { validationResult } = require('express-validator');
const Product = require('../models/product');
const { slugTextConverter } = require('../util/helpers');
const mongoose = require('mongoose');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null
  });
}

exports.postAddProduct = (req, res, next) => {

  const { title, price, description } = req.body;
  const titleSlug = slugTextConverter(title);
  const image = req.file;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title,
        price,
        description
      },
      errorMessage: errors.array()[0].msg
    });
  }
  
  const product = new Product({
    title,
    titleSlug,
    price,
    imageUrl: image.path,
    description,
    userId: req.user
  });

  product.save()
    .then((productSaved) => {
      console.log('Created product!');
      return productSaved;
    })
    .then((result) => {
      res.redirect('/');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

exports.getEditProduct = (req, res, next) => {
  const editMode = Boolean(req.query.edit);
  if (!editMode) {
    return res.redirect('/')
  }
  const prodId = req.params.productId;
  Product.findOne({ _id: prodId })
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
  const { title, price, description, productId: prodId } = req.body;
  const image = req.file;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render('admin/edit-product', {
      pageTitle: 'Add product',
      path: '/admin/add-product',
      editing: true,
      hasError: true,
      product: {
        title,
        price,
        description,
        _id: prodId
      },
      errorMessage: errors.array()[0].msg
    });
  }

  Product.findById(prodId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        console.log('Actualizacion de producto denegada')
        return res.redirect('/');
      }
      product.title = title;
      product.price = price;
      if(image) {
        product.imageUrl = image.path;  
      }
      product.description = description;
      return product.save()
        .then(result => {
          console.log('UPDATED PRODUCT!');
          res.redirect('/admin/products');
        })
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

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
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteOne({ '_id': prodId, 'userId': req.user._id })
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/products');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};