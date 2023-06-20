var express = require('express');
var router = express.Router();
var passport = require('../passport.js');

router.get('/twitter', passport.authenticate('twitter', { 
  scope: ["offline.access", "tweet.read", "users.read"] 
}));

router.get('/twitter/callback',
  passport.authenticate('twitter', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/' 
  }));

module.exports = router;
