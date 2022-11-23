var express = require('express');
var router = express.Router();

/*
  Página que dá início ao processo de registro de uso do passe urbano.
  O usuário digitará o código do bilhete desejado, que será passado como
  parâmetro para o módulo fazUso.js. Esse módulo fará os devidos registros
  no banco de dados e chamará a página web faazUso.ejs, que informará o
  usuário sobre os resultados da operação.
*/
router.get('/uso', function(req, res, next) {
  res.render('uso', { title: 'Uso do Passe' });
});

module.exports = router;