var db = require('../db.js');

/* GET friends list */
exports.get = function(id, next) {
  var sql = 'SELECT * FROM user, following '
    + 'WHERE user.id = following.friend_id '
    + 'AND following.user_id = ? '
    + 'ORDER BY following.created_at DESC';

  db.query(sql, id, function (err, result) {
    if (err) return next(err);
    next(null, result);
  });
};
