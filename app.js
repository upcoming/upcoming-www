var express = require('express');
var config = require('config');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var validator = require('express-validator');

var controllers = require('./controllers/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(validator());
app.use(express.static(path.join(__dirname, 'public')));

app.locals.moment = require('moment');
app.locals.twix = require('twix');
app.locals.truncate = require('truncate');
app.locals.slug = require('slug');
app.locals.slug.defaults.mode = 'rfc3986';

app.locals.marked = require('marked');
app.locals.marked.setOptions({
  gfm: true,
  breaks: true,
  sanitize: true,
  smartypants: true
});

var session = require('express-session');
var RedisStore = require('connect-redis')(session);

app.use(session({ 
    store: new RedisStore({
      host: '127.0.0.1',
      port: 6379,
      pass: config.redis_password
    }),
    secret: config.session_secret, 
    resave: false, 
    saveUninitialized: false,
    cookie: { maxAge: 365 * 24 * 60 * 60 * 1000 }
    })
  );

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});

app.use('/', controllers);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.render('404', { title: '404 Not Found' });
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
