var db = require('../db.js');

// create a new event
exports.create = function(user, venue, event, next) {
  var short_id = require('nid')({length:10});
  
  if (event.start_time == '') {
    event.start_time = null;
  }

  if (event.end_date == '') {
    event.end_date = null;
  }

  if (event.end_time == '') {
    event.end_time = null;
  }
  
  var event_id = short_id();
  var post = {
    event_id: event_id,
    title: event.title,
    description: event.description, 
    start_date: event.start_date,
    start_time: event.start_time, 
    end_date: event.end_date, 
    end_time: event.end_time, 
    website: event.website,
    venue_id: venue.venue_id,
    creator_user_id: user.id
  };
    
  db.query('INSERT INTO event SET ?', post, function (err, result) {
    if (err) return next(err);
    next(null, post);
  });
};

/* get a particular event by its id */
exports.get = function(id, next) {
  var sql = 'SELECT event.*, venue.*, user.*, COUNT(watchlist.status) AS recommend_count '
    + 'FROM venue, user, event '
    + 'LEFT JOIN watchlist ON watchlist.event_id = event.event_id '
    + 'WHERE event.venue_id = venue.venue_id '
    + 'AND user.id = event.creator_user_id '
    + 'AND event.event_id = ?';
  db.query({sql: sql, nestTables: true}, id, function (err, result) {
    if (err) return next(err);
    next(null, result[0]);
  });
};


exports.getAllByUser = function(user_id, next) {
  var sql = 'SELECT event.*, venue.*, user.* '
    + 'FROM event, venue '
    + 'WHERE event.venue_id = venue.venue_id '
    + 'AND event.creator_user_id = ?';
  db.query({sql: sql, nestTables: true}, user_id, function (err, rows) {
    if (err) return next(err);
    next(null, rows);
  });  
};

exports.all = function(next) {
  var sql = "SELECT event.*, user.*, venue.*, COUNT(watchlist.status) AS recommend_count "
          + "FROM venue, user, event "
          + "LEFT JOIN watchlist ON watchlist.event_id = event.event_id "
          + "WHERE event.creator_user_id = user.id "
          + "AND event.venue_id = venue.venue_id "
          + "AND start_date >= DATE( NOW() ) "
          + "GROUP BY event.id "
          + "ORDER BY event.start_date LIMIT 50";
  db.query({sql: sql, nestTables: true}, function (err, rows) {
    if (err) return next(err);
    next(null, rows);
  });  
};
    

