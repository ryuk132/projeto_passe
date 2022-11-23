var express = require('express');
var router = express.Router();

// Página que inicia o processo de recarga de um bilhete. 
// O usuário digitará o código do bilhete que deseja recarregar
// Esse código será passado como parâmetro para o módulo registraRecarga.js,
// que fará o registro da recarga e chamará a página web registraRecarga.ejs,
// que exibirá mensagem ao usuário informando o resultado da operação de
// recarga
router.get('/recarga', function(req, res, next) {
  res.render('recarga', { title: 'Recarga'});
});

module.exports = router;