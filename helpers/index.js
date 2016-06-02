var config = require('config');
var db = require('../db.js');

function getTwitterFriends(user_id, twitter_user_id, token_key, token_secret) {
  var twit = require('twit');
  var twitter = new twit({
        consumer_key:         config.twitter.consumer_key, 
        consumer_secret:      config.twitter.consumer_secret, 
        access_token:         token_key, 
        access_token_secret:  token_secret
  });
  
  // save twitter following list to mysql
  twitter.get('friends/ids', { user_id: twitter_user_id },  function (err, data, response) {
    console.log(data);
    for (var i = 0; i < data.ids.length; i++) {
      friend_twitter_id = data.ids[i];
      var post = { user_id: user_id, friend_twitter_id: friend_twitter_id };
      console.log(post);
      var query = db.query('INSERT IGNORE INTO twitter_following SET ?', post, function (err, result) {
        if (err) throw err;
      });
    }
  });
}

function updateFollowing(user_id) {
  var sql = "SELECT user.id AS friend_id FROM user, twitter_following "
          + "WHERE user.twitter_user_id = twitter_following.friend_twitter_id "
          + "AND twitter_following.user_id = ?";

  var query = db.query(sql, user_id, function (err, rows) {
    console.log(query.sql);
    if (err) throw err;
    for (var i in rows) {
      var friend = rows[i];
      var post = { user_id: user_id, friend_id: friend.friend_id, following_status: 1 };
      console.log('friend: ' + friend.friend_id);
      db.query('INSERT IGNORE INTO following SET ?', post, function (err, result) {          
        if (err) throw err;
      });
    }        
  });    
}


exports.getTwitterFriends = getTwitterFriends;
exports.updateFollowing = updateFollowing;