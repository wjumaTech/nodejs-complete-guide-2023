const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    require: true
  },
  email: {
    type: String,
    require: true
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          require: true
         },
        quantity: {
          type: Number,
          require: true
        }
      }
    ]
  }
});

userSchema.methods.addToCart = function(product) {

  /**
   * Validamos si el producto a agregar al carrito ya se encuentra agregado
   * de ser asi, obtenemos el index de la ubicacion del mismo.
   */
  const cartProductIndex = this.cart.items.findIndex( cp => { 
    return cp.productId.toString() === product._id.toString();
  });

  console.log(cartProductIndex)

  let newQuantity = 1;
  const updatedCartItems = [ ...this.cart.items ];

  if( cartProductIndex >= 0 ) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity
    });
  }

  const updatedCart = {
    items: updatedCartItems
  }

  this.cart = updatedCart;
  return this.save();

}



module.exports = mongoose.model('User', userSchema);

