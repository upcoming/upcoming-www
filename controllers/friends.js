var express = require('express');
var router = express.Router();
var Friends = require('../models/friend');

/* GET friends listing. */
router.get('/', function(req, res, next) {
  Friends.get(req.user.id, function (err, friends) {
    if (err) throw err;
    res.render('friends', { title: 'Friends', friends: friends});
  });
});

module.exports = router;
