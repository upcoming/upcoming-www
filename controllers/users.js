var express = require('express');
var router = express.Router();
var User = require('../models/user');

// POST user location
router.post('/location', function (req, res, next) {
  var user = req.user;
  var post = req.body;

  if (post.status == 'add') {
    User.addLocation(user, post, function (err, result) {
      if (err) throw err;
      res.json('success');
    });
  } else if (post.status == 'remove') {
    User.removeLocation(user, post, function (err, result) {
      if (err) throw err;
      res.json('success');
    });
  }
});

router.get(/(?:.*-|)(.+)$/, function(req, res, next) {
  user_id = req.params[0].replace(/\//g, '');
  
  // redirect old-school upcoming urls
  if (/^\d+$/.test(user_id)) {
    res.redirect('http://archive.upcoming.org/user/' + user_id);
    return;
  }
});


module.exports = router;