var npm
var router = express.Router();

/* GET home page. */
router.get('/criar', function(req, res, next) {
  res.render('criacao', { title: 'Criação', resultado: "0"});
});

module.exports = router;