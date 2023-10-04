const path = require('path');
const fs = require('fs');
const PDFDocument  = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');
const { response } = require('express');
const { request } = require('http');


exports.getProducts = (req, res, next) => {

  Product.find()
  .then((products) => {
      // console.log(products)
      res.render('shop/product-list', {
        path: '/products',
        pageTitle: 'Products',
        products,
        current: 1,
        pages: 1 
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
}

exports.getProductsPagination = (req, res, next) => {

  const perPage = 5
  const page = Number(req.params.page) || 1; 
  let itemsLength = 0;
  
  Product.find({})
    .countDocuments()
    .then((count, err) => {
      itemsLength = count;
      return Product.find({})
        .skip( (perPage * page) - perPage )
        .limit(perPage)
      })
      .then(products => {
        res.render('shop/product-list', {
          path: '/products',
          pageTitle: 'Products',
          products,
          current: page,
          pages: Math.ceil(itemsLength / perPage)
        });
      })
      .catch(err => {
        return next(new Error(err))
      })

}

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render('shop/index', {
        path: '/',
        pageTitle: 'Shop',
        products,

      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
}

exports.getProductDetail = async (req, res) => {
  try {
    const product = await Product.findOne({ 'titleSlug': req.params.titleSlug });
    res.render('shop/product-detail', {
      path: '/product/:titleSlug',
      pageTitle: 'Product detail',
      product
    })
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
}

exports.getCart = async (req, res) => {

  /**
   * In this case we use async/await becouse mongoose migrated populate
   * to this new paradig.
   */
  const cartUserProducts = await req.user.populate('cart.items.productId');
  const products = await cartUserProducts.cart.items;

  res.render('shop/cart', {
    path: '/cart',
    pageTitle: 'Cart',
    products,

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
      });
    });
}

exports.postOrder = async (req, res) => {
  const user = await req.user.populate('cart.items.productId');
  const products = await user.cart.items.map(i => {

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
      lastName: req.user.lastName,
      email: req.user.email,
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

exports.getInvoiceOrders = (req=request, res=response, next) => {
  
  const { orderId } = req.params;

  Order.findById(orderId)
    .then((order) => {

      if(!order) {
        return next(new Error('Not order found'));
      }
      
      if(order.user.userId.toString() !== req.user._id.toString() ) {
        return next(new Error('Unauthorized'));
      }

      const invoiceName = `invoice-${orderId}.pdf`;
      const invoicePath = path.join(__dirname, '../', 'data', 'invoice', invoiceName);


      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename: "'+ invoiceName +'"');

      // NOTE: Creating a PDFKit document
      const doc = new PDFDocument ();
      doc.pipe(fs.createWriteStream(invoicePath)); // write to PDF
      doc.pipe(res); // HTTP response

      // add stuff to PDF here using methods described below...

      const { outline } = doc;
      const top = outline.addItem('Top Level');
      top.addItem('Order Confirmation')

      doc.fillColor("#AA0000").fontSize("16").text('Ecommerce', {
        lineBreak: false,
        stroke: true
      }).fillColor("#000").fontSize("14").text("Orden Confirmation", {
        align: 'right',
        lineGap: 60
      });

      doc.font("Times-Bold").fontSize("15").fillColor('red').text('Hello ' + req.user.name.toUpperCase(), {
        lineGap: 10,
        lineBreak: true,
        continued: false
      });

      doc.font("Times-Roman").fillColor('#000').text('Thank you for shopping with us. Well send a confirmation when your item ships.', {
        
      });
      
      doc.text("Details", {
        lineGap: 10
      });

      doc.text(`Order #${order._id}`);

      let totalPrice = 0;

      order.products.forEach(prod => {
        totalPrice = totalPrice + (prod.quantity * prod.product.price); 
        doc.text(`${prod.quantity} ${prod.product.title} x $${prod.product.price}`); 
      });

      doc.fontSize("15").font("Times-Bold").text("Total price: $" + totalPrice);

      // finalize the PDF and end the stream
      doc.end();
      

      /**
       * No se recomiendo enviar los datos de esta forma para arcivos grandes 
       */
      // fs.readFile(invoicePath, (err, fileContent) => {
      //   if(err) {
      //     return next(err);
      //   }
        
      //   // NOTE: Content-Disposition
      //   /**
      //    * NOTE: Content-Disposition 
      //    * Set default database name to download file when client downloaded
      //    */
      //   res.setHeader('Content-Type', 'application/pdf');
      //   // res.setHeader('Content-Disposition', 'inline; filename: "'+ invoiceName +'"'); // Open a new windows with a file content 
      //   res.setHeader('Content-Disposition', 'attachment; filename: "'+ invoiceName +'"'); // Download the file to client file system 
    
      //   res.send(fileContent);
      // });

      // NOTE: Download File createReadStream
      // const FILE = fs.createReadStream(invoicePath);
      // res.setHeader('Content-Type', 'application/pdf');
      // res.setHeader('Content-Disposition', 'inline; filename: "'+ invoiceName +'"');
      // FILE.pipe(res);

    })
    .catch((err) => next(err));

}
