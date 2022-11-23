var express = require('express');
var router = express.Router();

/* Página que informa o usuário que seu bilhete foi usado */
router.get('/fazUso', function(req, res, next) {
  res.render('fazUso', { title: 'Uso do passe', resultado});
});

module.exports = router;