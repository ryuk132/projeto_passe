var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/relat', function(req, res, next) {
  res.render('relat', { title: 'Passe Urbano / Relatório de Uso' });
});

module.exports = router;