const path = require('path');
const express = require('express');
const router = express.Router();
const pages = require('../controllers/pages');
// const shopController = require('../controllers/products');
const rootDir = require('../util/path');

router.get('/', pages.getShopProducts);
// router.get('/wishlist', pages.getWishlist);
// router.get('/product-single', pages.getProductSingle);
router.get('/product-single/:productId', pages.getProductSingle);


module.exports = router;