var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/registraRecarga', function(req, res, next) {
  res.render('registraRecarga', { title: 'Recarga', resultado});
});

module.exports = router;