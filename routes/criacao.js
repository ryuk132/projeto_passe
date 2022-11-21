var npm
var router = express.Router();

/* Página que exibe as regras de uso do Passe Urbano e dá início à geração de novo passe */
router.get('/criar', function(req, res, next) {
  res.render('criacao', { title: 'Passe Urbano / Criação', resultado: "0"});
});

module.exports = router;