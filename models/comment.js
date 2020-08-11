var db = require('../db.js');

// create a new comment
exports.create = function(user, comment, next) {
  var post = {
    event_id: comment.event_id,
    user_id: user.id,
    comment_text: comment.comment_text
  };
    
  db.query('INSERT INTO comment SET created_at = NOW(), ?', post, function (err, result) {
    if (err) return next(err);
    next(null, post);
  });
};

/* find comments by event id */
exports.getAllByEventId = function(event_id, next) {
  var sql = 'SELECT comment.comment_text, comment.created_at, '
      + 'user.name, user.avatar_image_url, user.username, comment.created_at '
      + 'FROM comment, user '
      + 'WHERE comment.user_id = user.id '
      + 'AND user.deleted = 0 '
      + 'AND comment.event_id = ?';
  db.query(sql, event_id, function (err, rows) {
    if (err) return next(err);
    next(null, rows);
  });
};
