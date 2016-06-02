var express = require('express');
var router = express.Router();
var config = require('config');
var Venue = require('../models/venue');


router.get('/search', function(req, res, next) {
  var city = req.query.city;
  var query = req.query.query;
  var foursquare = require('node-foursquare-venues')(config.foursquare.client_id, config.foursquare.client_secret);

  foursquare.venues.suggestcompletion({near: city, query: query, intent: 'match'}, function(err, resp){
    res.json(resp.response.minivenues);
  });
});

router.get('/add', function(req, res, next) {
  res.render('add', { title: 'Add Venue' });
});


// post a new venue
router.post('/', function (req, res, next) {
  Venue.create(req.user, req.body, function (err, venue) {
    if (err) throw err;
    return(venue_id);
  });
});

/* GET venue listing. */
router.get(/(?:.*-|)(.+)$/, function(req, res, next) {
  venue_id = req.params[0].replace(/\//g, '');
  Venue.get(venue_id, function (err, venue) {
    if (err) throw err;
    Venue.getEvents(venue_id, function (err, events) {
      if (err) throw err;
      res.render('venue', { title: venue.name, venue: venue, events: events });
    });
  });
});


module.exports = router;
