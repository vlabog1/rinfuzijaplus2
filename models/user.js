const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
     firstname: {
        type: String,
        required: true
     },
     lastname: {
        type: String,
        required: true
     },
     streetaddress: {
        type: String,
        required: true
     },
     housenumber: {
      type: String,
      required: true
     },
     towncity: {
      type: String,
      required: true
     },
     postcodezip: {
      type: String,
      required: true
     },
     phone: {
      type: String,
      required: true
     },
     email: { 
        type: String,
        required: true
     },
     password: {
      type: String,
      required: true
     },
     resetToken: String,
     resetTokenExpiration: Date,
     cart: {
      items: [{productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true }, quantity: { type: Number, required: true }}]
     },
     role: { 
       type: String, 
       enum: ['admin', 'user'], 
       default: 'user'
     }
});

userSchema.methods.addToCart = function(product, quantity) {
      const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString();
      });
      
      let newQuantity = quantity;
      const updatedCartItems = [...this.cart.items];
      if (cartProductIndex >= 0) {
        newQuantity = quantity;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
      } else {
        updatedCartItems.push({
          productId: product._id,
          quantity: newQuantity
        });
      }
      
      const updatedCart = {
        items: updatedCartItems
      };

      this.cart = updatedCart;
     
      return this.save()
};

userSchema.methods.removeFromCart = function(productId) {
         const updatedCartItems = this.cart.items.filter(item => {
                  return item.productId.toString() !== productId.toString();
         });
         this.cart.items = updatedCartItems;
         return this.save();
}

userSchema.methods.clearCart = function() {
     this.cart = { items: [] };
     return this.save();
}

module.exports = mongoose.model('User', userSchema);
// const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;
// const ObjectId = mongodb.ObjectId;

// class User {
//      constructor(firstname, lastname, streetaddress, housenumber, towncity, postcodezip, phone, email, cart, id) {
//             this.firstname = firstname;
//             this.lastname = lastname;
//             this.streetaddress = streetaddress;
//             this.housenumber = housenumber;
//             this.towncity = towncity;
//             this.postcodezip = postcodezip;
//             this.phone = phone;
//             this.email = email;
//             this.cart = cart;
//             this._id = id ;
//      }
//      save() {
//         const db = getDb();
//         return db
//            .collection('users')
//            .insertOne(this)
//            .then(result => {
//                console.log(result, 'in save')
//            }).catch(err => {
//                console.log(err);
//            });
//      }

//      addToCart(product) {
//       const cartProductIndex = this.cart.items.findIndex(cp => {
        
//         return cp.productId.toString() === product._id.toString();
//       });
      
//       let newQuantity = 1;
//       const updatedCartItems = [...this.cart.items];
  
//       if (cartProductIndex >= 0) {
//         newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//         updatedCartItems[cartProductIndex].quantity = newQuantity;
//       } else {
//         updatedCartItems.push({
//           productId: new ObjectId(product._id),
//           quantity: newQuantity
//         });
//       }
      
//       const updatedCart = {
//         items: updatedCartItems
//       };
//       const db = getDb();
//       return db
//         .collection('users')
//         .updateOne(
//           { _id: new ObjectId(this._id) },
//           { $set: { cart: updatedCart } }
//         );
//     }
     
//      getCart() {
//             const db = getDb();
//             const productIds = this.cart.items.map(i => {
//                   return i.productId;
//             });
//             return db.collection('products').find({_id: {$in: productIds}}).toArray().then(products => {
//                   return products.map(p => {
//                         return {...p, quantity: this.cart.items.find(i => {
//                                return i.productId.toString() === p._id.toString();
//                             }).quantity
//                         };
//                   })
//             })
//      }

//      deleteItemFromCart(productId) {
//             const db = getDb();
//             const updatedCartItems = this.cart.items.filter(item => {
//                   return item.productId.toString() !== productId.toString();
//             });
//             return db.collection('users').updateOne(
//                 {_id: new ObjectId(this._id)}, 
//                 {$set: {cart: {items: updatedCartItems}}}
//             );
//      }

//      addOrder() {
//       const db = getDb();
//       return this.getCart().then(products => {
//         const order = {
//           items: products,
//           user: {
//               _id: new ObjectId(this._id),
//               firstname: this.firstname,
//               lastname: this.lastname,
//               streetaddress: this.streetaddress,
//               housenumber: this.housenumber,
//               towncity: this.towncity,
//               postcodezip: this.postcodezip,
//               phone: this.phone,
//               email: this.email
//           }
//         };
//         return db
//         .collection('orders')
//         .insertOne(order);
//       })
//       .then(result => {
//              this.cart = {items: []};
//                 return db
//                  .collection('users')
//                  .updateOne(
//                   { _id: new ObjectId(this._id) },
//                   { $set: { cart: {items: []} } }
//                  );
//       })
//   }


     
//      getOrders() {
//             const db = getDb();
//             return db
//                 .collection('orders')
//                 .find({'user._id': new ObjectId(this._id)})
//                 .toArray();
//      }

//      static findById(userId) {
//             const db = getDb();
//             return db.collection('users')
//                 .find({_id: new ObjectId(userId)})
//                 .next()
//                 .then(user => {
//                       // console.log(user)
//                       return user;
//                 })
//                 .catch(err => {
//                       console.log(err);
//                 });
//      }
// }

// module.exports = User;