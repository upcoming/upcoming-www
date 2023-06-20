var db = require('./db.js');
var helpers = require('./helpers');

var config = require('config');
var passport = require('passport');
const { Strategy } = require('@superfaceai/passport-twitter-oauth2');

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    var query = db.query("SELECT * FROM user WHERE id = ? ", [id], function(err, rows){
      var user = rows[0];        
      done(err, user);
    });
});

passport.use(
  new Strategy(
    {
        clientID: config.twitter.client_id,
        clientSecret: config.twitter.client_secret,
        callbackURL: config.twitter.callback_url,
        clientType: "confidential"
    },
    function (accessToken, refreshToken, profile, done) {
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
            verified: profile._json.verified
          };

          var query = db.query("INSERT INTO user SET created_at = NOW(), ?", new_user, function(err, result) {
            if (err) throw err;
            new_user.id = result.insertId;
            helpers.saveAvatar(new_user, profile);
            
            return done(null, new_user);
          });

        } else {
          var user = rows[0];
          
          // when signing in again, save the updated user info
          helpers.saveAvatar(user, profile);
          
          return done(null, user);
        }
      }
    );
  })
);

module.exports = passport;