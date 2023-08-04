// const Product = require('../models/product');

// exports.getProducts =  (req, res, next) => {
//     Product.fetchAll(products => {
//         res.render('pages/shop', {
//             prods: products,
//             pageTitle: 'Shop',
//             path: '/shop',
//             hasProducts: products.length > 0,
//             activeShop: true,
//             productCSS: true
//         });
//     });
// }

// exports.getProduct = (req, res, next) => {
//     const prodId = req.params.productId
//     Product.findById(prodId, products => {
//         res.render('/pages/product-single', {
//             product: products, 
//             pageTitle: products.title,
//             path: '/product-single' 
//         });
//     });
// }

// exports.postCart = (req, res, next) => {
//        const prodId = req.body.productId;
//        console.log(prodId);
//        res.redirect('/cart');
// }