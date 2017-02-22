var express = require('express');
var router = express.Router();
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();

var Following = require('../models/following');

/* GET following listing. */
router.get('/', ensureLoggedIn, function(req, res, next) {
  Following.get(req.user.id, function (err, following) {
    if (err) throw err;
    res.render('following', { title: 'Following', following: following});
  });
});

module.exports = router;
