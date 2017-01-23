var express = require('express');
var router = express.Router();
var Event = require('../models/event');
var Venue = require('../models/venue');
var Watchlist = require('../models/watchlist');
var Comment = require('../models/comment');

// show add event form
router.get('/add', function(req, res, next) {
  res.render('add', { title: 'Add Event' });
});


// POST event
router.post('/add', function (req, res, next) {
  user = req.user;
  post = req.body;
  
  Venue.create(user, post, function (err, venue) {
    if (err) throw err;
    Event.create(user, venue, post, function (err, event) {
      if (err) throw err;
      res.redirect('/event/' + req.app.locals.slug(event.title) + '-' + event.event_id);
    });
  });  
});


// GET event by id, ignoring slug
router.get(/(?:.*-|)(.+)$/, function(req, res, next) {
  user = req.user;
  event_id = req.params[0].replace(/\//g, '');
  
  Event.get(event_id, user, function (err, result) {
    if (err) throw err;
    Watchlist.getAllByEventId(event_id, function (err, watchlists) {
      if (err) throw err;    
      Comment.getAllByEventId(event_id, function (err, comments) {
        if (err) throw err;
        title = result.event.title + ' at ' + result.venue.name;
        res.render('event', { title: title, result: result, watchlists: watchlists, comments: comments });
      });
    });
  });
});



module.exports = router;