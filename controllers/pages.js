const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');
// const Cart = require('../models/cart');
const User = require('../models/user');

const ITEMS_PER_PAGE = 20;

exports.getIndexProducts = (req, res, next) => {
    Product.find()
      .then(products => {
        if(!req.user) {
          res.render('pages/index', {
            products: products,
            pageTitle: 'Naslovna',
            path: '/index',
            hasProducts: products.length > 0,
            role: false
        });
        } else {
            let role = req.user.role;
            console.log(role)
            res.render('pages/index', {
              products: products,
              pageTitle: 'Naslovna',
              path: '/index',
              hasProducts: products.length > 0,
              totalProducts: req.user.cart.items.length,
              firstname: req.user.firstname,
              lastname: req.user.lastname,
              isAuthenticated: req.session.isLoggedIn,
              role: role
          }); 
        }
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        console.log(err)
        return next(error);
     });

}

exports.getShopProducts =  (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;
  Product.find().countDocuments().then(numProducts => {
    totalItems = numProducts;
    return Product.find()
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE);
  })
  .then(products => {
    if(!req.user) {
      res.render('pages/shop', {
        products: products,
        pageTitle: 'Prodavnica',
        path: '/shop',
        hasProducts: products.length > 0,
        activeShop: true,
        productCSS: true,
        isAuthenticated: req.session.isLoggedIn,
        role: false,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      firstPage: 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
    });
    } else {
        let role = req.user.role;
        res.render('pages/shop', {
          products: products,
          pageTitle: 'Prodavnica',
          path: '/shop',
          hasProducts: products.length > 0,
          activeShop: true,
          productCSS: true,
          isAuthenticated: req.session.isLoggedIn,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        firstPage: 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        totalProducts: req.user.cart.items.length,
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        role: role
      });
    }
  })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
     });
}

// exports.getWishlist = (req, res, next) => {
//     res.render('pages/wishlist', { pageTitle: 'Vegefoods-wishlist', path: '/wishlist' });
// }

exports.getProductSingle = (req, res, next) => {
         if(!req.user) {
           console.log(req.user)
          const prodId = req.params.productId
          console.log(prodId)
          Product.findById(prodId)
          .then(product => {
                 console.log(product)
                     return res.render('pages/product-single', {
                          product: product, 
                          pageTitle: product.title,
                          path: '/product-single',
                          isAuthenticated: req.session.isLoggedIn
                      });
          })
          .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
         });
         } else {
          let role = req.user.role;
          const prodId = req.params.productId
          const cartProdId = req.user.cart.items
          let quantity = '1'
          Product.findById(prodId)
          .then(product => {
            cartProdId.forEach(items => {
            if(items.productId.toString() === prodId.toString()) {
                return quantity = items.quantity.toString()
            }
          })
           return res.render('pages/product-single', {
                product: product, 
                pageTitle: product.title,
                path: '/product-single',
                isAuthenticated: req.session.isLoggedIn,
                quantity: quantity,
                totalProducts: req.user.cart.items.length,
                role: role,
                firstname: req.user.firstname,
                lastname: req.user.lastname
            });
         })
          .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
           });
         }
}

exports.getCart = (req, res, next) => {
    let role = req.user.role;
    req.user
      .populate('cart.items.productId')
      .execPopulate()
      .then(user => {
            //  console.log(user.cart.items);
             const products = user.cart.items;
             let total = 0;
             const numberOfProducts = products.length;
             console.log(numberOfProducts)
             products.forEach(p => {
                  total += p.quantity * p.productId.price;
             });

             res.render('pages/cart', { 
             pageTitle: 'Korpa', 
             path: '/cart',
             products: products,
             isAuthenticated: req.session.isLoggedIn,
             totalSum: total,
             totalProducts: numberOfProducts,
             role: role,
             firstname: req.user.firstname,
             lastname: req.user.lastname
             });
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
     });
}

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    const quantity = req.body.quantity;
    const cartProdId = req.user.cart.items
    Product.findById(prodId)
    .then(product => {
        // cartProdId.forEach(items => {
        //    if(items.productId.toString() === prodId.toString()) {
        //         cartProdId.save()
        //    }
        // })
        return req.user.addToCart(product, quantity);
    })
    .then(result => {
            // console.log(result);
            res.redirect('/cart');
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
     });
}

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user
      .removeFromCart(prodId)
      .then(result => {
              res.redirect('/cart');
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
     });
}

exports.postOrder = (req, res, next) => {
    req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
           const products = user.cart.items.map(i => {
                return { quantity: i.quantity, product: { ...i.productId._doc } };
           });
           const order = new Order({
            user: {
                 firstname: req.user.firstname,
                 lastname: req.user.lastname,
                 streetaddress: req.user.streetaddress,
                 housenumber: req.user.housenumber,
                 towncity: req.user.towncity,
                 postcodezip: req.user.postcodezip,
                 phone: req.user.phone,
                 email: req.user.email,
                 userId: req.user
            },
            products: products
       });
       return order.save();
    })
      .then(result => {
          return req.user.clearCart();
      })
      .then(() => {
            res.redirect('/order')
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
     });
}

exports.getOrders = (req, res, next) => {
      let role = req.user.role;
      Order.find({'user.userId': req.user._id})
        .then(orders => {
                    res.render('pages/order', {
                      path: '/orders',
                      pageTitle: 'Vaše narudžbine',
                      orders: orders,
                      isAuthenticated: req.session.isLoggedIn,
                      role: role,
                      totalProducts: req.user.cart.items.length,
                      firstname: req.user.firstname,
                      lastname: req.user.lastname
                    })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            console.log('error from getOrders')
            return next(error);
         });
}

exports.getTotal = (req, res, next) => {
               let role = req.user.role;
               const orderId = order._id
               Order.findById(orderId).then(orderses => {
                console.log(orderses)
                let totalPrice = 0;
                orderses.products.forEach(prod => {
                      totalPrice = totalPrice + prod.quantity * prod.product.price;
                      console.log(totalPrice);
                });
                res.render('pages/order', {
                  path: '/orders',
                  pageTitle: 'Your Orders',
                  isAuthenticated: req.session.isLoggedIn,
                  role: role,
                  totalSum: totalPrice
                })
              })
              .catch(err => next(err));
}

// exports.getSignup = (req, res, next) => {
//     res.render('/signup', { 
//         pageTitle: 'Vegefoods-signup', 
//         path: '/signup',
//         editing: false,
//         isAuthenticated: req.session.isLoggedIn
//      });
// }

exports.getCheckout = (req, res, next) => {
  let role = req.user.role;
  req.user
  .populate('cart.items.productId')
  .execPopulate()
  .then(user => {
         console.log(user);
         const products = user.cart.items;
         let total = 0;
         products.forEach(p => {
              total += p.quantity * p.productId.price;
         });
         res.render('pages/checkout', {
         pageTitle: 'Ispravka', 
         path: '/checkout',
         products: products,
         isAuthenticated: req.session.isLoggedIn,
         role: role,
         totalSum: total,
         firstName: user.firstname,
         lastname: user.lastname,
         streetaddress: user.streetaddress,
         housenumber: user.housenumber,
         towncity: user.towncity,
         postcodezip: req.user.postcodezip,
         phone: req.user.phone,
         emailaddress: req.user.email,
         userId: req.user,
         totalProducts: req.user.cart.items.length,
         firstname: req.user.firstname,
         lastname: req.user.lastname
         });
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
 });
}
// exports.postAddUser = (req, res, next) => {
//     const title = req.body.title;
//     const imageUrl = req.body.imageUrl;
//     const price = req.body.price;
//     const description = req.body.description;
//     const product = new Product(title, imageUrl, price, description, null, req.user._id);
//     product.save()   
//         .then(result => {
//            console.log(result);
//           res.redirect('/shop');
//         })
//         .catch(err => {
//            console.log(err);
//         });
// }

exports.getAbout = (req, res, next) => {
    if(!req.user) {
      res.render('pages/about', { 
        pageTitle: 'O nama', 
        path: '/about', 
        isAuthenticated: req.session.isLoggedIn,
        role: false
      });
    } else {
      let role = req.user.role;
      res.render('pages/about', { 
        pageTitle: 'O nama', 
        path: '/about', 
        isAuthenticated: req.session.isLoggedIn,
        totalProducts: req.user.cart.items.length,
        role: role,
        firstname: req.user.firstname,
        lastname: req.user.lastname
      });
    }
}

exports.getBlog = (req, res, next) => {
    if(!req.user) {
      res.render('pages/blog', {  
        pageTitle: 'Blog', 
        path: '/blog', 
        isAuthenticated: req.session.isLoggedIn,
        role: false
      });
    } else {
      let role = req.user.role;
      res.render('pages/blog', { 
        pageTitle: 'Blog', 
        path: '/blog', 
        isAuthenticated: req.session.isLoggedIn,
        totalProducts: req.user.cart.items.length,
        role: role,
        firstname: req.user.firstname,
        lastname: req.user.lastname
      });
    }
   
}

exports.getBlogSingle = (req, res, next) => {
    if(!req.user) {
      res.render('pages/blog-single', { 
        pageTitle: 'Blog proizvod', 
        path: '/blog-single', 
        isAuthenticated: req.session.isLoggedIn,
        role: false
      });
    } else {
      let role = req.user.role;
      res.render('pages/blog-single', { 
        pageTitle: 'Blog proizvod', 
        path: '/blog-single', 
        isAuthenticated: req.session.isLoggedIn, 
        totalProducts: req.user.cart.items.length,
        role: role,
        firstname: req.user.firstname,
        lastname: req.user.lastname 
      });
    }
    
}

exports.getContact = (req, res, next) => {
    if(!req.user) {
      res.render('pages/contact', { 
        pageTitle: 'Kontakt', 
        path: '/contact', 
        isAuthenticated: req.session.isLoggedIn,
        role: false
      });
    } else {
      let role = req.user.role;
      res.render('pages/contact', { 
        pageTitle: 'Kontakt', 
        path: '/contact', 
        isAuthenticated: req.session.isLoggedIn,
        totalProducts: req.user.cart.items.length,
        role: role,
        firstname: req.user.firstname,
        lastname: req.user.lastname
      });
    }
    
}

// exports.getShop = (req, res, next) => {
//     res.render('pages/shop', { pageTitle: 'Vegefoods-shop', path: '/shop' });
// }

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    console.log(orderId);
    Order.findById(orderId).then(order => {
         console.log(order)
         if(!order) {
               return next(new Error('No order found.'));
         }
         if(order.user.userId.toString() !== req.user._id.toString()) {
              return next(new Error('Unauthorized'));
         }
         const invoiceName = 'invoice-' + orderId + '.pdf';
         const invoicePath = path.join('data', 'invoices', invoiceName);

         const pdfDoc = new PDFDocument();
         res.setHeader('Content-Type', 'application/pdf');
         res.setHeader('Content-Disposition', 'inline; filename="'+ invoiceName +'"');
         pdfDoc.pipe(fs.createWriteStream(invoicePath));
         pdfDoc.pipe(res);

         pdfDoc.fontSize(26).text('Ukupan racun za korisnika' + ` ${order.user.firstname + ' ' + order.user.lastname}`, {
              underline: true
         });
         
         pdfDoc.text('-----------------------------------------');
         let totalPrice = 0;
         order.products.forEach(prod => {
               totalPrice = totalPrice + prod.quantity * prod.product.price;
               pdfDoc.fontSize(14).text( prod.quantity + ' x ' + '$' + prod.product.price + ' === ' + `${prod.product.title}`);
               console.log(prod.quantity)
         }); 
         pdfDoc.text('-----------------------------------------');
         pdfDoc.fontSize(18).text('Ukupan zbir: $' + totalPrice);
   
         pdfDoc.end();
        //  fs.readFile(invoicePath, (err, data) => {
        //         if(err) {
        //             return next(err);
        //         }
        //         res.setHeader('Content-Type', 'application/pdf');
        //         res.setHeader('Content-Disposition', 'inline; filename="'+ invoiceName +'"');
        //         res.send(data);
        //  })
        // const file = fs.createReadStream(invoicePath);
        
        // file.pipe(res);
    }).catch(err => next(err));
}


