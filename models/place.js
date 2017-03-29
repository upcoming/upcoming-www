var db = require('../db.js');

// create a new place
exports.create = function(user, place, next) {
  var post = {
    name: place.properties.name,
    gid: place.properties.gid,
    layer: place.properties.layer,
    label: place.properties.label,
    locality: place.properties.locality,
    locality_gid: place.properties.locality_gid,
    borough: place.properties.borough,
    borough_gid: place.properties.borough_gid,
    county: place.properties.county,
    county_gid: place.properties.county_gid,
    region: place.properties.region,
    region_gid: place.properties.region_gid,
    region_a: place.properties.region_a,
    macroregion: place.properties.macroregion,
    macroregion_gid: place.properties.macroregion_gid,
    country: place.properties.country,
    country_gid: place.properties.country_gid,
    country_a: place.properties.country_a,
    latitude: place.geometry.coordinates[0],
    longitude: place.geometry.coordinates[1]
  };
    
  db.query('INSERT IGNORE INTO place SET created_at=NOW(), ?', post, function (err, result) {
    if (err) return next(err);
    next(null, post);
  });
};

exports.getPopular = function(next) {
  var sql = "SELECT locality.id, locality.name, locality.gid, region.name, region.gid, country.name, country.gid, COUNT(*) AS event_count "
          + "FROM event, venue, venue_gid locality "
          + "LEFT JOIN venue_gid region ON region.venue_id = locality.venue_id "
          + "AND region.layer = 'region' "
          + "LEFT JOIN venue_gid country ON country.venue_id = locality.venue_id "
          + "AND country.layer = 'country' "
          + "WHERE event.venue_id = venue.venue_id AND venue.venue_id = locality.venue_id "
          + "AND locality.layer = 'locality' "
          + "AND event.start_date >= NOW() "
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
