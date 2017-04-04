var db = require('./db.js');
var helpers = require('./helpers');

var config = require('config');
var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    var query = db.query("SELECT * FROM user WHERE id = ? ", [id], function(err, rows){
      var user = rows[0];
      if ("undefined" === typeof user) {user = null};
      done(err, user);
    });
});

passport.use(
  new TwitterStrategy({
    consumerKey: config.twitter.consumer_key,
    consumerSecret: config.twitter.consumer_secret,
    callbackURL: config.twitter.callback_url
  },
  function(token_key, token_secret, profile, done) {
    db.query("SELECT * FROM user WHERE twitter_user_id = ?", [profile.id], function(err, rows) {
      if (err)
        return done(err);

      // user doesn't exist, create it
      if (!rows.length) {
        var new_user = {
          name: profile.displayName,
          username: profile.username,
          twitter_user_id: profile.id,
          description: profile._json.description,
          url: profile._json.url,
          profile_image_url: profile._json.profile_image_url,
          location: profile._json.location,
          utc_offset: profile._json.utc_offset,
          time_zone: profile._json.time_zone,
          verified: profile._json.verified,
          twitter_friends_count: profile._json.friends_count,
          twitter_followers_count: profile._json.followers_count,
          token_key: token_key,
          token_secret: token_secret
        };

        var query = db.query("INSERT INTO user SET created_at = NOW(), ?", new_user, function(err, result) {
          if (err) throw err;
          new_user.id = result.insertId;
          helpers.saveAvatar(new_user, token_key, token_secret);
          helpers.getTwitterFriends(new_user.id, profile.id, token_key, token_secret);

          return done(null, new_user);
        });

      } else {
        var user = rows[0];
        // TODO: only retrieve new friends list if not updated in x days
        // helpers.getTwitterFriends(rows[0].id, profile.id, token_key, token_secret);

        // TODO: update twitter token key and token secret in db, update twitter profile info

        // existing user, update following list and sign them in
        helpers.saveAvatar(user, token_key, token_secret);
        helpers.getTwitterFriends(user.id, user.twitter_user_id, token_key, token_secret);

        return done(null, user);
      }
    });
  })
);

module.exports = passport;
