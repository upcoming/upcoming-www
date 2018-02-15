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

  db.query('INSERT INTO event SET created_at = NOW(), ?', post, function (err, result) {
    if (err) return next(err);
    next(null, post);
  });
};

// edit an event
exports.update = function(user, venue, event, next) {
  if (event.start_time == '') {
    event.start_time = null;
  }

  if (event.end_date == '') {
    event.end_date = null;
  }

  if (event.end_time == '') {
    event.end_time = null;
  }

  var post = {
    title: event.title,
    description: event.description,
    start_date: event.start_date,
    start_time: event.start_time,
    end_date: event.end_date,
    end_time: event.end_time,
    website: event.website,
    venue_id: venue.venue_id,
    event_id: event.event_id
  };

  db.query('UPDATE event SET ? WHERE event_id = ?', [post, event.event_id], function (err, result) {
    if (err) return next(err);
    next(null, post);
  });
};


/* get a particular event by its id */
exports.get = function(event_id, user, next) {
  if (user) {
    var sql = "SELECT event.*, user.*, venue.*, locality.*, region.name, country.name, watchlist.status, "
            + "COUNT(watchlist.user_id) AS watchlist_count, COUNT(friend_watchlist.user_id) AS watchlist_count, "
            + "COUNT(following.friend_id) AS friend_count "
            + "FROM user, event "
            + "LEFT JOIN venue ON venue.venue_id = event.venue_id "
            + "LEFT JOIN venue_gid locality ON locality.venue_id = venue.venue_id AND locality.layer = 'locality' "
            + "LEFT JOIN venue_gid region ON region.venue_id = venue.venue_id AND region.layer = 'region' "
            + "LEFT JOIN venue_gid country ON country.venue_id = venue.venue_id AND country.layer = 'country' "
            + "LEFT JOIN watchlist friend_watchlist ON friend_watchlist.event_id = event.event_id "
            + "LEFT JOIN watchlist ON watchlist.event_id = event.event_id AND watchlist.user_id = ? "
            + "LEFT JOIN following ON friend_watchlist.user_id = following.friend_id AND following.user_id = ? "
            + "WHERE event.creator_user_id = user.id "
            + "AND event.event_id = ? "
            + "GROUP BY event.id";

    db.query({sql: sql, nestTables: true}, [ user.id, user.id, event_id ], function (err, result) {
      if (err) return next(err);
      next(null, result[0]);
    });

  } else {
    var sql = "SELECT event.*, user.*, venue.*, locality.*, region.name, country.name, "
            + "COUNT(watchlist.user_id) AS watchlist_count "
            + "FROM user, event "
            + "LEFT JOIN venue ON venue.venue_id = event.venue_id "
            + "LEFT JOIN venue_gid locality ON locality.venue_id = venue.venue_id AND locality.layer = 'locality' "
            + "LEFT JOIN venue_gid region ON region.venue_id = venue.venue_id AND region.layer = 'region' "
            + "LEFT JOIN venue_gid country ON country.venue_id = venue.venue_id AND country.layer = 'country' "
            + "LEFT JOIN watchlist friend_watchlist ON friend_watchlist.event_id = event.event_id "
            + "LEFT JOIN watchlist ON watchlist.event_id = event.event_id "
            + "WHERE event.creator_user_id = user.id "
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
    + 'FROM event, venue, user '
    + 'WHERE event.venue_id = venue.venue_id '
    + 'AND event.creator_user_id = ?';
  db.query({sql: sql, nestTables: true}, user_id, function (err, rows) {
    if (err) return next(err);
    next(null, rows);
  });
};

exports.search = function(user, options, next) {
  if (user) {
    var sql = "SELECT event.*, user.*, venue.*, watchlist.status, "
            + "COUNT(friend_watchlist.user_id) AS watchlist_count, "
            + "COUNT(following.friend_id) AS friend_count "
            + "FROM user, event "
            + "LEFT JOIN venue ON venue.venue_id = event.venue_id "
            + "LEFT JOIN venue_gid ON venue_gid.venue_id = venue.venue_id "
            + "LEFT JOIN watchlist friend_watchlist ON friend_watchlist.event_id = event.event_id "
            + "LEFT JOIN watchlist ON watchlist.event_id = event.event_id AND watchlist.user_id = ? "
            + "LEFT JOIN following ON friend_watchlist.user_id = following.friend_id AND following.user_id = ? "
            + "WHERE event.deleted = 0 "
            + "AND user.deleted = 0 "
            + "AND event.creator_user_id = user.id ";

    if (options['when'] == 'all') {
      // don't constrain event selection
    } else if (options['when'] == 'past') {
      sql += "AND start_date < DATE( NOW() ) ";
    } else {
      // default to future events
      sql += "AND start_date >= DATE( NOW() ) ";
    }

    if (options['filter'] == 'user') {
      if (options['user_id']) {
        user_id = options['user_id'];
      } else {
        user_id = user.id;
      }
      sql += "AND (event.creator_user_id = " + db.escape(user_id) + " OR friend_watchlist.user_id = " + db.escape(user_id) + ") ";
    }

    if (options['gid'] && options['gid'] != 'all') {
      sql += "AND venue_gid.gid = " + db.escape(options['gid']) + " ";
    }

    sql   += "GROUP BY event.id ";

    if (options['filter'] == 'following') {
      sql +=  "HAVING friend_count > 0 ";
    }

    if (options['sort'] == 'recommended') {
      sql += "ORDER BY friend_count DESC, watchlist_count DESC ";
    } else if (options['sort'] == 'new') {
      sql += "ORDER BY event.created_at DESC, event.id DESC ";
    } else if (options['sort'] == 'popular') {
      sql += "ORDER BY watchlist_count DESC ";
    } else {
      if (options['when'] == 'past') {
        sql += "ORDER BY event.start_date DESC, friend_count DESC, watchlist_count DESC ";
      } else {
        sql += "ORDER BY event.start_date, friend_count DESC, watchlist_count DESC ";
      }
    }

    sql += "LIMIT 50";

    db.query({sql: sql, nestTables: true}, [ user.id, user.id ], function (err, rows) {
      if (err) return next(err);
      next(null, rows);
    });
  } else {
    var sql = "SELECT event.*, user.*, venue.*,  "
            + "COUNT(watchlist.user_id) AS watchlist_count "
            + "FROM user, event "
            + "LEFT JOIN venue ON venue.venue_id = event.venue_id "
            + "LEFT JOIN venue_gid ON venue_gid.venue_id = venue.venue_id "
            + "LEFT JOIN watchlist ON watchlist.event_id = event.event_id "
            + "WHERE event.deleted = 0 "
            + "AND user.deleted = 0 "
            + "AND event.creator_user_id = user.id ";

    if (options['when'] == 'all') {
      // don't constrain event selection
    } else if (options['when'] == 'past') {
      sql += "AND start_date <= DATE( NOW() ) ";
    } else {
      // default to future events
      sql += "AND start_date >= DATE( NOW() ) ";
    }

    if (options['filter'] == 'user') {
      if (options['user_id']) {
        user_id = options['user_id'];
      }
      sql += "AND (event.creator_user_id = " + db.escape(options['user_id']) + " OR watchlist.user_id = " + db.escape(options['user_id']) + ") ";
    }

    if (options['gid'] && options['gid'] != 'all') {
      sql += "AND venue_gid.gid = " + db.escape(options['gid']) + " ";
    }

    sql   += "GROUP BY event.id ";

    if (options['sort'] == 'recommended') {
      sql += "ORDER BY watchlist_count DESC ";
    } else if (options['sort'] == 'new') {
      sql += "ORDER BY event.created_at DESC, event.id DESC ";
    } else if (options['sort'] == 'popular') {
      sql += "ORDER BY watchlist_count DESC ";
    } else {
      sql += "ORDER BY event.start_date, watchlist_count DESC ";
    }

    sql += "LIMIT 50";

    db.query({sql: sql, nestTables: true}, function (err, rows) {
      if (err) return next(err);
      next(null, rows);
    });
  }
};
