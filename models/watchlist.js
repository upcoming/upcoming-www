var db = require('../db.js');

/* create a watchlist */
exports.create = function(user, watchlist, next) {
  var post = {
    user_id: user.id,
    event_id: watchlist.event_id,
    status: watchlist.status,
  };
  
  db.query('INSERT INTO watchlist SET created_at=NOW(), ? ON DUPLICATE KEY UPDATE status=VALUES(status)', post, function (err, result) {
    if (err) return next(err);
    next(null, post);
  });
};


/* find watchlists by event id */
exports.getAllByEventId = function(event_id, next) {
  var sql = 'SELECT * FROM user, watchlist '
    + 'WHERE user.user_id = watchlist.user_id '
    + 'AND event_id = ?';
      
  db.query(sql, event_id, function (err, rows) {
    if (err) return next(err);
    next(null, rows);
  });
};
