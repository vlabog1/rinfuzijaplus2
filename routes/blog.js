const path = require('path');
const express = require('express');
const router = express.Router();
const pages = require('../controllers/pages');
const rootDir = require('../util/path');


router.get('/blog', pages.getBlog);
router.get('/blog-single', pages.getBlogSingle);

module.exports = router;