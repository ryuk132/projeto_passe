var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/uso', function(req, res, next) {
  res.render('uso', { title: 'Passe Urbano / Uso do Passe' });
});

module.exports = router;