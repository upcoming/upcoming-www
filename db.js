var config = require('config');

var mysql   = require('mysql');
var db    = mysql.createPool({
  connectionLimit : 10,
  host     : config.database.host,
  user     : config.database.user,
  password : config.database.pass,
  database : config.database.database,
  charset  : 'utf8mb4'
});

module.exports = db