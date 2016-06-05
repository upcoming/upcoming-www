var express = require('express');
var router = express.Router();
var db = require('../db.js');
var Event = require('../models/event');
var User = require('../models/user');


router.use('/auth', require('./auth'));
router.use('/event', require('./events'));
router.use('/venue', require('./venues'));
router.use('/user', require('./users'));
router.use('/friends', require('./friends'));
router.use('/watchlist', require('./watchlists'));
router.use('/comment', require('./comments'));

/* GET home page. */
router.get('/', function(req, res, next) {
  Event.all(req.user, function (err, results) {
    if (err) throw err;
    res.render('index', { title: 'Home', results: results });
  });
});

/* GET user */
router.get(/@(.+)$/, function(req, res, next) {
  username = req.params[0].replace(/\//g, '');
  
  User.get(username, function (err, user) {
    if (err) throw err;
    User.getEvents(user.id, function (err, events) {
      if (err) throw err;
      res.render('user', { title: user.username, current_user: user, events: events});
    });
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
