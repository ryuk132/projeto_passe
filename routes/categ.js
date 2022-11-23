var express = require('express');
var router = express.Router();

/* Página que exibe lista de categorias cadastradas no Banco de Dados */
router.get('/categ', function(req, res, next) {
    res.render('categ', { title: 'Lista de Categorias'});
  });
module.exports = router;