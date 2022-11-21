var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/categ', function(req, res, next) {
    res.render('categ', { title: 'Passe Urbano / Lista de Categorias'});
  });
module.exports = router;