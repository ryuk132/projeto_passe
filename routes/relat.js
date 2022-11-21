var express = require('express');
var router = express.Router();

/* 
   Página web que dá início ao processo de relatório de uso. O usuário digitará o
   código do bilhete, que será passado como parâmetro para o módulo relatUso.js, 
   que buscará os dados de uso no banco de dados e os devolverá para a página
   web relatUso.ejs, que os processará, registro a registro, preenchendo uma tabela
   com os registros de uso do bilhete
*/
router.get('/relat', function(req, res, next) {
  res.render('relat', { title: 'Passe Urbano / Relatório de Uso' });
});

module.exports = router;