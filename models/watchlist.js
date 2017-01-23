var db = require('../db.js');

/* create a watchlist item */
exports.add = function(user, watchlist, next) {
  var post = {
    user_id: user.id,
    event_id: watchlist.event_id,
    status: watchlist.status,
  };
  console.log(JSON.stringify(post));
  
  db.query('INSERT INTO watchlist SET created_at=NOW(), ? ON DUPLICATE KEY UPDATE status=VALUES(status)', post, function (err, result) {
    if (err) return next(err);
    next(null, post);
  });
};


/* remove a watchlist item */
exports.remove = function(user, watchlist, next) {
  db.query('DELETE FROM watchlist WHERE user_id = ? AND event_id = ?', [user.id, watchlist.event_id], function (err, result) {
    if (err) return next(err);
    next(null, result);
  });
};


/* get a watchlist item */
exports.get = function(user, event_id, next) {
  db.query('SELECT status, created_at FROM watchlist WHERE user_id = ? AND event_id = ?', [user.id, event_id], function (err, rows) {
    if (err) return next(err);
    next(null, rows[0]);
  });
};


/* find watchlists by event id */
exports.getAllByEventId = function(event_id, next) {
  var sql = 'SELECT * FROM user, watchlist '
    + 'WHERE user.id = watchlist.user_id '
    + 'AND event_id = ?';

  db.query(sql, event_id, function (err, rows) {
    if (err) return next(err);
    next(null, rows);
  });
};
