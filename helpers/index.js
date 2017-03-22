var config = require('config');
var db = require('../db.js');
var request = require('request');
// request.debug = 'true';


exports.getTwitterFriends = function getTwitterFriends(user_id, twitter_user_id, token_key, token_secret) {
  var twit = require('twit');
  var twitter = new twit({
        consumer_key:         config.twitter.consumer_key, 
        consumer_secret:      config.twitter.consumer_secret, 
        access_token:         token_key, 
        access_token_secret:  token_secret
  });
  
  // save twitter following list to mysql
  twitter.get('friends/ids', { user_id: twitter_user_id },  function (err, data, response) {
    for (var i = 0; i < data.ids.length; i++) {
      friend_twitter_id = data.ids[i];
      var post = { user_id: user_id, friend_twitter_id: friend_twitter_id };
      var query = db.query('INSERT IGNORE INTO twitter_following SET ?', post, function (err, result) {
        if (err) throw err;
      });
    }
  });
}

exports.updateFollowing = function updateFollowing(user_id) {
  var sql = "SELECT user.id AS friend_id FROM user, twitter_following "
          + "WHERE user.twitter_user_id = twitter_following.friend_twitter_id "
          + "AND twitter_following.user_id = ?";

  var query = db.query(sql, user_id, function (err, rows) {
    if (err) throw err;
    for (var i in rows) {
      var friend = rows[i];
      var post = { user_id: user_id, friend_id: friend.friend_id, following_status: 1 };
      db.query('INSERT IGNORE INTO following SET ?', post, function (err, result) {          
        if (err) throw err;
      });
    }
  });    
}

exports.reverse_geocode = function(venue_id, next) {
  db.query("SELECT * FROM venue WHERE venue_id = ?", venue_id, function(err, rows) {
    if (err) {
      return next(err);
    }
  
    if (rows.length > 0) {
      var venue = rows[0];
      var options = {
        uri: 'https://search.mapzen.com/v1/reverse',
        qs: {
          api_key: config.mapzen.api_key,
          'point.lat': venue.latitude,
          'point.lon': venue.longitude,
          size: 1
        },
        json: true
      };
  
      request(options, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          if (body.features[0]) {          
            var properties = body.features[0].properties;
            var layers = ['neighbourhood', 'borough', 'localadmin', 'locality', 'county', 'macrocounty', 'region', 'macroregion', 'country'];
            
            for (var i=0; i < layers.length; i++) {
              var layer = layers[i];
              if (layer in properties) {
                var layer_gid = layer + '_gid';

                var sql = 'INSERT IGNORE INTO venue_gid (venue_id, name, gid, layer, created_at) '
                  + 'VALUES (?, ?, ?, ?, NOW())';
            
                db.query(sql, [venue_id, properties[layer], properties[layer_gid], layer], function (err, result) {
                  if (err) return next(err);
                });
              }
            }
          }
        }         
      });
    } else {
      next(null, rows[0]);
    }
  });
};

