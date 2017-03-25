var db = require('../db.js');

exports.getPopular = function(next) {
  var sql = "SELECT locality.id, locality.name, locality.gid, region.name, region.gid, country.name, country.gid, COUNT(*) AS event_count "
          + "FROM event, venue, venue_gid locality "
          + "LEFT JOIN venue_gid region ON region.venue_id = locality.venue_id "
          + "AND region.layer = 'region' "
          + "LEFT JOIN venue_gid country ON country.venue_id = locality.venue_id "
          + "AND country.layer = 'country' "
          + "WHERE event.venue_id = venue.venue_id AND venue.venue_id = locality.venue_id "
          + "AND locality.layer = 'locality' "
          + "GROUP BY locality.gid "
          + "ORDER BY event_count DESC "
          + "LIMIT 25";
    
  db.query({sql: sql, nestTables: true}, function (err, rows) {
    if (err) return next(err);
    next(null, rows);
  });  
};

exports.get = function(place_id, next) {
  var sql = "SELECT locality.name, locality.gid, region.name, region.gid, country.name, country.gid "
          + "FROM venue_gid locality "
          + "LEFT JOIN venue_gid region ON region.venue_id = locality.venue_id "
          + "AND region.layer = 'region' "
          + "LEFT JOIN venue_gid country ON country.venue_id = locality.venue_id "
          + "AND country.layer = 'country' "
          + "WHERE locality.id = ? AND locality.layer = 'locality'";

  db.query({sql: sql, nestTables: true}, place_id, function (err, result) {
    if (err) return next(err);
    next(null, result[0]);
  });  
};
