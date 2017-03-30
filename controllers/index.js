var express = require('express');
var router = express.Router();
var db = require('../db.js');
var Event = require('../models/event');
var User = require('../models/user');
var Backer = require('../models/backer');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();

router.use('/api', require('./api'));
router.use('/auth', require('./auth'));
router.use('/event', require('./events'));
router.use('/place', require('./places'));
router.use('/venue', require('./venues'));
router.use('/user', require('./users'));
router.use('/following', require('./following'));
router.use('/watchlist', require('./watchlists'));
router.use('/comment', require('./comments'));

/* GET home page. */
router.get('/', function(req, res, next) {
  var user_locations;
  if (req.user) {
    User.getLocations(req.user, function (err, user_locations) {
      if (err) throw err;
      res.render('index', { title: 'Home', user_locations: user_locations });
    });
  } else {
    res.render('index', { title: 'Home' });
  }    
});

router.get('/home/all', function(req, res, next) {
  options = { 
    when: req.query.when,
    sort: req.query.sort,
    gid: req.query.gid,
    filter: req.query.filter
  };
  
  Event.search(req.user, options, function (err, results) {
    if (err) throw err;
    res.render('event-list', { results: results });
  });
});

router.get('/home/following', function(req, res) {
  options = { 
    when: req.query.when,
    sort: req.query.sort,
    gid: req.query.gid,
    filter: 'following',
  };
  
  Event.search(req.user, options, function (err, results) {
    if (err) throw err;
    res.render('event-list', { results: results });
  });
});

router.get('/home/my', function(req, res) {
  options = { 
    when: req.query.when,
    sort: req.query.sort,
    gid: req.query.gid,
    filter: 'user',
  };
  
  Event.search(req.user, options, function (err, results) {
    if (err) throw err;
    res.render('event-list', { results: results });
  });
});

/* GET user */
router.get(/@(.+)$/, function(req, res, next) {
  username = req.params[0].replace(/\//g, '');
  
  User.get(username, function (err, user) {
    options = { 
      filter: 'user',
      user_id: user.id,
      when: req.query.when,
      sort: req.query.sort
    };
    if (err) throw err;
    Event.search(req.user, options, function (err, results) {
      if (err) throw err;
      res.render('user', { title: user.name, current_user: user, results: results });
    });
  });
});

router.get('/login', function(req, res){
  res.redirect('/auth/twitter');
});

router.get('/logout', function(req, res){
  req.session.destroy(function(e){
      req.logout();
      res.redirect('/');
  });
});

router.get('/about', function(req, res, next) {
  res.render('about', { title: 'About' });
});

router.get('/about/backers', function(req, res, next) {
  Backer.getAll(req.user, function (err, results) {
    if (err) throw err;
    res.render('backers', { title: 'Backers', results: results });
  });
});

router.get('/robots.txt', function(req, res, next) {
  if ('/robots.txt' == req.url) {
    res.type('text/plain')
    res.send("User-agent: AhrefsBot\nDisallow: /");
  } else {
    next();
  }
});

module.exports = router;
