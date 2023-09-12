const Product = require('../models/product');
const { slugTextConverter } = require('../util/helpers');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add product',
    path: '/admin/add-product',
    editing: false,
    csrfToken: req.csrfToken()
  });
}

exports.postAddProduct = (req, res) => {
  const { title, price, imageUrl, description } = req.body;
  const titleSlug = slugTextConverter(title);
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
        product: product,
        csrfToken: req.csrfToken()
      });
    });
}

exports.postEditProduct = (req, res, next) => {
  const { title, price, imageUrl, description, productId:prodId } = req.body;
  Product.findById(prodId)
    .then((product) => {
      product.title = title;
      product.price = price;
      product.imageUrl = imageUrl;
      product.description = description;
      return product.save();
    })
    .then(result => {
      console.log('UPDATED PRODUCT!');
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
}

exports.getProducts = (req, res, next) => {
  Product.find()
    .populate('userId')
    .then((products) => {
      res.render('admin/products', {
        pageTitle: 'Admin Products',
        path: '/admin/products',
        products,
        csrfToken: req.csrfToken()
      });
    })
    .catch((err) => console.log(err));
}

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByIdAndRemove(prodId)
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
};
