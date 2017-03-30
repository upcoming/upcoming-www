var db = require('../db.js');
var helpers = require('../helpers');

// create a new venue
exports.create = function(user, venue, next) {
  db.query("SELECT * FROM venue WHERE foursquare_id = ?", venue.foursquare_id, function(err, rows) {
    if (err) {
      return next(err);
    }
  
    if (!rows.length) {
      var short_id = require('nid')({length:10});
      var venue_id = short_id();
      
      var post = {
        venue_id: venue_id,
        name: venue.name,
        foursquare_id: venue.foursquare_id,
        address: venue.address,
        locality: venue.locality,
        region: venue.region,
        postal_code: venue.postal_code,
        longitude: venue.longitude,
        latitude: venue.latitude,
        creator_user_id: user.id
      };
        
      db.query('INSERT INTO venue SET created_at = NOW(), ?', post, function (err, result) {
        if (err) return next(err);
        helpers.reverse_geocode(venue_id, function (err, events) {
          if (err) throw err;
          return(venue_id);
        });    
        
        exports.get(venue_id, next);
      });
    } else {
      next(null, rows[0]);
    }
  });
};


/* get a particular venue by its id */
exports.get = function(id, next) {
  var sql = 'SELECT * FROM venue WHERE venue_id = ?';
  db.query(sql, id, function (err, result) {
    if (err) return next(err);
    next(null, result[0]);
  });
};


exports.getEvents = function(venue_id, next) {
  var sql = 'SELECT * FROM event '
    + 'WHERE venue_id = ? '
    + 'ORDER BY start_date';
  db.query(sql, venue_id, function (err, rows) {
    if (err) return next(err);
    next(null, rows);
  });  
};
