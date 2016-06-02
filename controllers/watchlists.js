var express = require('express');
var router = express.Router();
var Watchlist = require('../models/watchlist');


// POST watchlist
router.post('/', function (req, res, next) {
  user = req.user;
  post = req.body;

  Watchlist.create(user, post, function (err, result) {
    if (err) throw err;
    res.redirect('/event/' + post.event_id);
  });
});


// GET watchlists by event
router.get('/list/:event_id', function(req, res, next) {
  Watchlist.getAllByEvent(event_id, function (err, watchlists) {
    if (err) throw err;
  });
});

module.exports = router;
