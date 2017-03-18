var db = require('../db.js')

exports.getAll = function(user, next) {
  var sql = 'SELECT backer.id, backer.user_id, backer.name, backer.reward, '
    + 'user.id, user.name, user.username '
    + 'FROM backer LEFT JOIN user ON user.id = backer.user_id '
    + 'ORDER BY backer.name';
  
  db.query({sql: sql, nestTables: true}, function (err, rows) {
    if (err) return next(err);
    next(null, rows);
  });  
};
