var express = require('express');
var config = require('config');
var router = express.Router();
var passport = require('../passport.js');

router.get('/twitter', passport.authenticate('twitter'));

router.get('/twitter/callback',
  passport.authenticate('twitter', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/' 
  }));

module.exports = router;
