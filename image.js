var express = require('express')
  , jsdom = require('jsdom')
  , request = require('request')
  , url = require('url')
  ,fs = require('fs') 
  , http = require('http')
  , path = require('path');

var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/q' ,function(req,res){
    var sh = req.query.image;
    if(!sh){
        return;        
    }
    console.log('getting one request http://i.ytimg.com/vi/' + sh + '/mqdefault.jpg');    
    request('http://i.ytimg.com/vi/' + sh + '/mqdefault.jpg').pipe(res);
  });
  
/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('یافت نشد');
    err.status = 404;
    next(err);
});

/// error handlers

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

var debug = require('debug')('nodetube');

app.set('port', process.env.PORT || 2829);

var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});
