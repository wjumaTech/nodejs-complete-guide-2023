const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    require: true
  },
  lastName: {
    type: String,
    require: true
  },
  email: {
    type: String,
    require: true
  },
  password: {
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

userSchema.methods.deleteItemFromCart = function(prodId) {

  /**
   * Para eliminar un articulo de la lista en el carro de compras, primero identificamos el articulo
   * realizando una busqueda en el carrito del usuario y devolvemos un nuevo arreglo con los articulos
   * omitiendo este ultimo, asi queda eliminado de la lista del carrito de comparas.
   */
  const UPDATED_CART_ITEMS = this.cart.items.filter( items => {
    return items.productId._id.toString() !== prodId.toString();
  });

  this.cart.items = UPDATED_CART_ITEMS;

  return this.save();
}

userSchema.methods.clearCart = function() {
  this.cart = {
    items: []
  }
  return this.save();
}

module.exports = mongoose.model('User', userSchema);
