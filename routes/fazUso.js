var express = require('express');
var router = express.Router();

/* Página que informa o usuário que seu bilhete foi usado */
router.get('/fazUso', function(req, res, next) {
  res.render('fazUso', { title: 'Passe Urbano / Uso do passe / Resultado', resultado});
});

module.exports = router;