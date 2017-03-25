var express = require('express');
var config = require('config');
var router = express.Router();
var Event = require('../models/event');
var Place = require('../models/place');
var request = require('request');
// request.debug = 'true';


// GET popular places
router.get('/', function(req, res, next) {
  Place.getPopular(function (err, results) {
    if (err) throw err;
    res.render('place-list', { title: 'Popular Places', places: results });
  });
});


// GET place
router.get(/(.*-|)(.+)$/, function(req, res, next) {
  user = req.user;

  // check for existing place locally
  if (!isNaN(req.params[1])) {
    place_id = req.params[1].replace(/\//g, '');
    Place.get(place_id, function (err, place) {
      if (err) throw err;
      options = { 
        sort: req.query.sort,
        when: req.query.when,
        gid: place.locality.gid
      };
  
      Event.search(req.user, options, function (err, results) {
        if (err) throw err;
        res.render('place', { title: place.locality.name, place: place, results: results });
      });
    });
      
  } else {
    // if doesn't exist, geocode place with mapzen and save results
    query = req.params[0] + req.params[1];
    query = query.replace(/\//g, '');
    query = query.replace(/-/g, ' ');

    var options = {
      uri: 'https://search.mapzen.com/v1/search',
      qs: {
        api_key: config.mapzen.api_key,
        text: query,
        layers: 'locality,borough',
        sources: 'wof',
        size: 1
      },
      json: true
    };
  
    request(options, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          if (body.features[0]) {          
            var place = body.features[0];
            
            options = { 
              sort: req.query.sort,
              when: req.query.when,
              gid: place.properties.locality_gid
            };
            
            Event.search(req.user, options, function (err, results) {
              if (err) throw err;
              res.render('place', { title: place.properties.name, place: place, results: results });
            });
            
          } else {
            res.render('404', { title: '404 Not Found' });
          }
        } else {
          console.log(error);
        }
      }
    );
  }
      
});

module.exports = router;
