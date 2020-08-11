var db = require('../db.js');

/* GET following list */
exports.get = function(id, next) {
  var sql = 'SELECT * FROM user, following '
    + 'WHERE user.id = following.friend_id '
    + 'AND following.user_id = ? '
    + 'AND user.deleted = 0 '
    + 'ORDER BY following.created_at DESC';

  db.query(sql, id, function (err, result) {
    if (err) return next(err);
    next(null, result);
  });
};
