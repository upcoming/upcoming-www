var db = require('../db.js')

/* get a particular user by its id */
exports.get = function(username, next) {
  var sql = 'SELECT * FROM user WHERE username = ?';
  db.query(sql, username, function (err, result) {
    if (err) return next(err);
    next(null, result[0]);
  });
};

exports.create = function(user, done) {
  var values = {
    username: user.username, 
    twitter_user_id: user.user_id
  };
  
  db.query('INSERT INTO user SET ?', values, function(err, result) {
    if (err) return done(err);
    done(null, result.insertId);
  });
};

exports.find = function(user, done) {  
  db.query('SELECT * FROM user WHERE twitter_user_id = ?', user.user_id, function(err, result) {
    if (err) return done(err)
    done(null, result.insertId)
  });
};

exports.getEvents = function(user_id, next) {
  var sql = 'SELECT event.*, venue.*, watchlist.* '
    + 'FROM event, venue, watchlist '
    + 'WHERE event.venue_id = venue.venue_id '
    + 'AND event.event_id = watchlist.event_id '
    + 'AND watchlist.user_id = ? '
    + 'AND start_date >= NOW '
    + 'GROUP BY event.event_id '
    + 'ORDER BY start_date';
  db.query({sql: sql, nestTables: true}, user_id, function (err, rows) {
    if (err) return next(err);
    next(null, rows);
  });  
};
