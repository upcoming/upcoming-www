var db = require('../db.js');

exports.getPopular = function(next) {
  var sql = "SELECT venue_gid.gid, venue_gid.name, venue.locality, venue.region, COUNT(*) AS event_count "
    + "FROM event, venue, venue_gid "
    + "WHERE event.venue_id = venue.venue_id "
    + "AND venue.venue_id = venue_gid.venue_id "
    + "AND venue_gid.layer = 'locality' "
    + "GROUP BY venue_gid.gid "
    + "ORDER BY event_count DESC "
    + "LIMIT 25";
    
  db.query({sql: sql, nestTables: true}, function (err, rows) {
    if (err) return next(err);
    next(null, rows);
  });  
};
