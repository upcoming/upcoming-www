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
exports.get = function(event_id, user, next) {
  if (user) {
    var sql = "SELECT event.*, user.*, venue.*, watchlist.status, "
            + "COUNT(friend_watchlist.user_id) AS watchlist_count, "
            + "COUNT(following.friend_id) AS friend_count "
            + "FROM venue, user, event "
            + "LEFT JOIN watchlist friend_watchlist ON friend_watchlist.event_id = event.event_id "
            + "LEFT JOIN watchlist ON watchlist.event_id = event.event_id AND watchlist.user_id = ? "
            + "LEFT JOIN following ON friend_watchlist.user_id = following.friend_id AND following.user_id = ? "
            + "WHERE event.creator_user_id = user.id "
            + "AND event.venue_id = venue.venue_id "
            + "AND event.event_id = ? "
            + "GROUP BY event.id";

    db.query({sql: sql, nestTables: true}, [ user.id, user.id, event_id ], function (err, result) {
      if (err) return next(err);
      next(null, result[0]);
    });
    
  } else {
    var sql = "SELECT event.*, user.*, venue.*, COUNT(watchlist.user_id) AS watchlist_count "
            + "FROM venue, user, event "
            + "LEFT JOIN watchlist ON watchlist.event_id = event.event_id "
            + "WHERE event.creator_user_id = user.id "
            + "AND event.venue_id = venue.venue_id "
            + "AND event.event_id = ? "
            + "GROUP BY event.id";
  
    db.query({sql: sql, nestTables: true}, event_id, function (err, result) {
      if (err) return next(err);
      next(null, result[0]);
    });  
  };
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

exports.all = function(user, next) {
  if (user) {
    var sql = "SELECT event.*, user.*, venue.*, watchlist.status, "
            + "COUNT(friend_watchlist.user_id) AS watchlist_count, "
            + "COUNT(following.friend_id) AS friend_count "
            + "FROM venue, user, event "
            + "LEFT JOIN watchlist friend_watchlist ON friend_watchlist.event_id = event.event_id "
            + "LEFT JOIN watchlist ON watchlist.event_id = event.event_id AND watchlist.user_id = ? "
            + "LEFT JOIN following ON friend_watchlist.user_id = following.friend_id AND following.user_id = ? "
            + "WHERE event.creator_user_id = user.id "
            + "AND event.venue_id = venue.venue_id "
            + "AND start_date >= DATE( NOW() ) "
            + "GROUP BY event.id "
            + "ORDER BY DATE(event.start_date), friend_count DESC, watchlist_count DESC "
            + "LIMIT 50";

    db.query({sql: sql, nestTables: true}, [ user.id, user.id ], function (err, rows) {
      if (err) return next(err);
      next(null, rows);
    });
  } else {
    var sql = "SELECT event.*, user.*, venue.*, COUNT(watchlist.user_id) AS watchlist_count "
            + "FROM venue, user, event "
            + "LEFT JOIN watchlist ON watchlist.event_id = event.event_id "
            + "WHERE event.creator_user_id = user.id "
            + "AND event.venue_id = venue.venue_id "
            + "AND start_date >= DATE( NOW() ) "
            + "GROUP BY event.id "
            + "ORDER BY DATE(event.start_date), watchlist_count LIMIT 50";
  
    db.query({sql: sql, nestTables: true}, function (err, rows) {
      if (err) return next(err);
      next(null, rows);
    });    
  }
};
    

