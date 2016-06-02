var express = require('express');
var router = express.Router();
var User = require('../models/user');


/* GET user by id */
router.get(/(?:.*-|)(.+)$/, function(req, res, next) {
  username = req.params[0].replace(/\//g, '');
  
  User.get(username, function (err, user) {
    if (err) throw err;
    User.getEvents(user.user_id, function (err, events) {
      if (err) throw err;
      res.render('user', { title: user.username, current_user: user, events: events});
    });
  });
});

module.exports = router;