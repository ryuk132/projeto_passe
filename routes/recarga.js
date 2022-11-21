var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/recarga', function(req, res, next) {
  res.render('recarga', { title: 'Passe Urbano / Recarga'});
});

module.exports = router;