var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/fazUso', function(req, res, next) {
  res.render('fazUso', { title: 'Passe Urbano / Uso do passe / Resultado', resultado});
});

module.exports = router;