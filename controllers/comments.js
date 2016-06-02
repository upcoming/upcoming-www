var express = require('express');
var router = express.Router();
var Comment = require('../models/comment');

// POST comment
router.post('/', function (req, res, next) {
  user = req.user;
  post = req.body;
  
  Comment.create(user, post, function (err, comment) {
    if (err) throw err;
    res.redirect('/event/' + post.event_id);
  });
});

// GET comments by event
router.get('/event/:event_id', function(req, res, next) {
  Comment.getAllByEvent(event_id, function (err, comments) {
    if (err) throw err;
  });

});


module.exports = router;