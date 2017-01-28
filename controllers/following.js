var express = require('express');
var router = express.Router();
var Following = require('../models/following');

/* GET following listing. */
router.get('/', function(req, res, next) {
  Following.get(req.user.id, function (err, following) {
    if (err) throw err;
    res.render('following', { title: 'Following', following: following});
  });
});

module.exports = router;
