var express = require('express');
var router = express.Router();
var Event = require('../models/event');
var Venue = require('../models/venue');
var Watchlist = require('../models/watchlist');
var Comment = require('../models/comment');
var User = require('../models/user');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();

// add new event
router.post('/add', function (req, res, next) {
  user = req.user;
  post = req.body;
  
  // validate form
  req.checkBody('title', 'Event name is required.').notEmpty();
  req.checkBody('start_date', 'Start date is required.').isDate();
  req.checkBody('name', 'Venue can\'t be blank, sorry.').notEmpty();
  req.checkBody('foursquare_id', 'A valid venue is required. Search to find one!').notEmpty();
  var errors = req.validationErrors();
  
  if (errors) {
    res.render('add', { title: 'Add Event', alert: { type: 'alert-danger', messages: errors } });
  } else {
    Venue.create(user, post, function (err, venue) {
      if (err) throw err;
      Event.create(user, venue, post, function (err, event) {
        if (err) throw err;
        
        // watchlist the event after creation 
        var watchlist = { event_id: event.event_id, status: 'watch' };
        Watchlist.add(user, watchlist, function (err, result) {
          if (err) throw err;
        });
        
        res.redirect('/event/' + req.app.locals.slug(event.title) + '-' + event.event_id);
      });
    });
  }
});

// edit event
router.post('/edit', function (req, res, next) {
  user = req.user;  
  post = req.body;
  
  // only allow editing if created by authed user
  Event.get(post.event_id, user, function (err, result) {
    if (err) throw err;
    if ( user.id != 1 && user.id != result.event.creator_user_id ) {
      res.redirect('/event/' + req.app.locals.slug(result.event.title) + '-' + result.event.event_id); 
    }
  });

  // validate form
  req.checkBody('title', 'Event name is required.').notEmpty();
  req.checkBody('start_date', 'Start date is required.').isDate();
  req.checkBody('name', 'Venue can\'t be blank, sorry.').notEmpty();
  req.checkBody('foursquare_id', 'A valid venue is required. Search to find one!').notEmpty();
  var errors = req.validationErrors();
  
  if (errors) {
    Event.get(post.event_id, user, function (err, result) {
      if (err) throw err;
      res.render('edit', { title: 'Edit Event', result: result, alert: { type: 'alert-danger', messages: errors } });
    });
  } else {
    Venue.create(user, post, function (err, venue) {
      if (err) throw err;
      Event.update(user, venue, post, function (err, event) {
        if (err) throw err;
        res.redirect('/event/' + req.app.locals.slug(event.title) + '-' + event.event_id);
      });
    });
  }
});

// show add event form
router.get('/add', ensureLoggedIn, function(req, res, next) {
  user = req.user;
  User.getLastLocation(user, function (err, result) {
    if (err) throw err;
    res.render('add', { title: 'Add Event', place: result });
  });
});

// show edit event form
router.get(/(?:.*-|)(.+)\/edit$/, ensureLoggedIn, function(req, res, next) {
  event_id = req.params[0].replace(/\//g, '');
  user = req.user;
  Event.get(event_id, user, function (err, result) {
    if (err) throw err;
    if (user.id == 1 || user.id == result.event.creator_user_id) {
      res.render('edit', { title: 'Edit Event', result: result });
    } else {
      res.redirect('/event/' + req.app.locals.slug(result.event.title) + '-' + result.event.event_id); 
    }
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
        req.session.returnTo = req.originalUrl;
        res.render('event', { title: title, result: result, watchlists: watchlists, comments: comments });
      });
    });
  });
});


module.exports = router;