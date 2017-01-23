var express = require('express');
var router = express.Router();
var Watchlist = require('../models/watchlist');


// POST watchlist
router.post('/', function (req, res, next) {
  var user = req.user;
  var post = req.body;

  if (post.status == 'attend' || post.status == 'watch' ) {
    Watchlist.add(user, post, function (err, result) {
      if (err) throw err;
      if (!res.xhr) {
        res.redirect('/event/' + post.event_id);
      }
    });
  } else if (!post.status) {
    Watchlist.remove(user, post, function (err, result) {
      if (err) throw err;
      if (!res.xhr) {
        res.redirect('/event/' + post.event_id);
      }
    });
  }
});

// Get watchlist item status for event/user
router.get('/status/:event_id', function(req, res, next) {
  var user = req.user;
  Watchlist.get(user, req.params.event_id, function (err, result) {
    if (err) throw err;
    res.send(result);
  });
});

// GET watchlists by event
router.get('/list/:event_id', function(req, res, next) {
  Watchlist.getAllByEvent(req.params.event_id, function (err, watchlists) {
    if (err) throw err;
  });
});

module.exports = router;
