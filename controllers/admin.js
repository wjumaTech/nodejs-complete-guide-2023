const mongoose = require('mongoose');

const { faker } = require('@faker-js/faker');
const { validationResult } = require('express-validator');

const Product = require('../models/product');

const { slugTextConverter } = require('../util/helpers');
const unlinkFileUtil = require('../util/file.util');


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
      res.redirect('/products/1');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}


exports.getAddFakerProducts = (req, res, next) => {
  res.render('admin/add-faker-products', {
    path: '/admin/add-faker-products',
    pageTitle: 'Add Faker Products',
    errorMessage: null
  });
}

exports.postAddFakerProducts = (req, res, next) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/add-faker-products', {
      pageTitle: 'Add Faker Products',
      path: '/admin/add-faker-products',
      errorMessage: errors.array()[0].msg
    });
  }

  const quantity = req.body.quantity || 1;
  
  for( let i = 0; i <= quantity; i++ ) {

    const product = new Product();
    
    product.title = faker.commerce.productName();
    product.titleSlug = slugTextConverter(product.title);
    product.price = faker.commerce.price()
    product.imageUrl= faker.image.avatar();
    product.description = faker.commerce.productDescription()
    product.userId = req.user
  
    product.save()
      .then(() => {})
      .catch(err => console.log(err))

  }
  
  res.redirect('/products');

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
        unlinkFileUtil(product.imageUrl)
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

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.prodId;
  Product.findById(prodId)
    .then(product => {
      unlinkFileUtil(product.imageUrl);
      return Product.deleteOne({ '_id': prodId, 'userId': req.user._id })
    })
    .then(() => {
      console.log(`DESTROYED PRODUCT WITH ID: ${prodId}`);
      res.json({ message: 'Success!' });
    })
    .catch(err => {
      res.json({ message: 'Error trying delete product, please try again!' })
    });
};