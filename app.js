var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var forceSsl = require('force-ssl-heroku');

/* stuff to handle user local authentication */
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');

// set up database connection
var mongoose = require('mongoose');
var mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/transnews';
//console.log('mongodb url set to: ' + mongoUrl.substring(0,15)); // DON'T send the whole thing plaintext, eeek!
var db = mongoose.createConnection(mongoUrl);
//TODO error handler
// cadged from http://stackoverflow.com/questions/10873199/how-to-handle-mongoose-db-connection-interruptions
db.on('error', function (err) {
	// shouldn't need this line : if (err) // couldn't connect
	// log the error
	console.log('database connection error: ' + err);
	// hack the driver to allow re-opening after initial network error
	db.db.close();
	// retry if desired
	db.open(mongoUrl);

});

mongoose.connect(mongoUrl);

// site routes
var routes = require('./routes/index');
var user = require('./routes/user');
var article = require('./routes/article');

var app = express();
app.use(forceSsl);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


/* This is for passport */
app.use(session({
  //secret: 'replace with some long random number'
  secret: '14E16991F7FF7F170151D31FF6C8BB20314FE5ECC56D944F0415D3B44B5B3DD6'
}));

require('./config/passport')(passport);
// passport.js module.export exports a function
// that expects a passport object as an argument.
// This require statement calls that function with the passport
// object you required on line 10.

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

/*End of stuff for passport. */

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/user', user);
app.use('/article', article);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
