'use strict'

var express = require('express');
var ArticleController = require('../controllers/article');

var router = express.Router();
var path  = require('path');

/*
var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './upload/articles'});
*/
/*
const multer = require('multer')({
    dest: 'upload/articles'
})
*/
var crypto = require('crypto')
var multer = require('multer');

const storage = multer.diskStorage({
  destination(req, file, cb){
    cb(null, './upload/articles');
  },

  filename(req, file={}, cb){
    const { originalname } = file;

    const fileExtension = (originalname.match(/\.+[\S]+$/) || [])[0];
    // cb(null, `${file.fieldname}__${Date.now()}${fileExtension}`);
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + fileExtension);
    });
  },

});
var mul_upload = multer({dest: './upload/articles',storage});



// Rutas de prueba
router.post('/datos-curso', ArticleController.datosCurso);
router.get('/test-de-controlador', ArticleController.test);

// Rutas utiles
router.post('/save', ArticleController.save);
router.get('/articles/:last?', ArticleController.getArticles);
router.get('/article/:id', ArticleController.getArticle);
router.put('/article/:id', ArticleController.update);
router.delete('/article/:id', ArticleController.delete);
router.post('/upload-image/:id?', mul_upload.single('image'), ArticleController.upload);
router.get('/get-image/:image', ArticleController.getImage);
router.get('/search/:search', ArticleController.search);

module.exports = router;