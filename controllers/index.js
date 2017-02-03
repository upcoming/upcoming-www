var express = require('express');
var router = express.Router();
var db = require('../db.js');
var Event = require('../models/event');
var User = require('../models/user');


router.use('/auth', require('./auth'));
router.use('/event', require('./events'));
router.use('/venue', require('./venues'));
router.use('/user', require('./users'));
router.use('/following', require('./following'));
router.use('/watchlist', require('./watchlists'));
router.use('/comment', require('./comments'));

/* GET home page. */
router.get('/', function(req, res, next) {
  options = { 
    when: req.query.when,
    sort: req.query.sort
  };
  
  Event.search(req.user, options, function (err, results) {
    if (err) throw err;
    res.render('index', { title: 'Home', results: results });
  });
});

/* GET user */
router.get(/@(.+)$/, function(req, res, next) {
  username = req.params[0].replace(/\//g, '');
  
  User.get(username, function (err, user) {
    options = { 
      filter: 'user',
      user_id: user.id,
      timespan: 'all'
    };
    if (err) throw err;
    Event.search(req.user, options, function (err, results) {
      if (err) throw err;
      res.render('user', { title: 'User', current_user: user, results: results });
    });
  });
});

router.get('/following', function(req, res){
  options = { 
    filter: 'friends',
    timespan: 'all'
  };
  
  Event.search(req.user, options, function (err, results) {
    if (err) throw err;
    res.render('index', { title: 'Following', results: results });
  });
});

router.get('/logout', function(req, res){
  console.log('logging out');  
  req.session.destroy(function(e){
      req.logout();
      res.redirect('/');
  });
});

function isAuthenticated(req, res, next) {
    if (req.user.authenticated) {
      return next();
    }
    res.redirect('/');

}


router.get('/about', function(req, res, next) {
  res.render('about', { title: 'About' });
});

router.get('/guidelines', function(req, res, next) {
  res.render('guidelines', { title: 'Guidelines' });
});

module.exports = router;
