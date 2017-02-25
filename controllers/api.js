var express = require('express');
var router = express.Router();
var Event = require('../models/event');
var Venue = require('../models/venue');
var Watchlist = require('../models/watchlist');
var Comment = require('../models/comment');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();

router.get('/events/user', function(req, res, next) {
  options = { 
    filter: 'following',
  };
  
  Event.search(req.user, options, function (err, results) {
    if (err) throw err;
    res.json(results);
  });
});


module.exports = router;