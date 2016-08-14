var express = require('express');
var router = express.Router();

/* GET trips home - korea or abroad 분기점을 보여주는 page */
router.get(['/','/tripsKorea'], function(req, res, next) {
  res.render('trips/tripsKorea');
});

/* GET ADD */
router.get('/tripsKorea_add', function(req, res){
  res.render('trips/tripsKorea_add');
});

module.exports = router;
