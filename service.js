var express = require('express')
  , jsdom = require('jsdom')
  , request = require('request')
  , url = require('url')
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

app.get('/search',function(req,res){
   var q = req.query.q,
       part = req.query.part;
       
   if(!q){
       return;        
   } 
   request({uri: 'https://www.googleapis.com/youtube/v3/search?type=video&maxResults=50&part='+part+''+'&q='+q+'&key=AIzaSyARSABX27_wqgECdGT9QPWMXNiFuqKU9VI'}, function(err, response, body){
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(body);   
    });
});

app.get('/s' ,function(req,res){
    var sh = req.query.searchvalue;
    if(!sh){
        return;        
    }
    console.log('getting one request '+ sh);    
    request({uri: 'http://www.youtube.com/'+ sh +'/videos'}, function(err, response, body){
    var self = this;
    self.items = new Array();
    //Just a basic error check
    if(err && response.statusCode !== 200){console.log('Request error.');}
    //Send the body param as the HTML code we will parse in jsdom
    //also tell jsdom to attach jQuery in the scripts and loaded from jQuery.com
    var result=[];
    jsdom.env({
      html: body,
      scripts: ['https://code.jquery.com/jquery-2.1.1.min.js'],
      done: function(err, window){
        //Use jQuery just as in a regular HTML page
        var $ = window.jQuery;
        var $body = $('body');
        var $videos = $body.find('.channels-content-item');
           $videos.each(function (i, item) { 
                var $a = $(item).find('.yt-lockup-thumbnail a'),
                	$title = $(item).find('.yt-lockup-title a').text(),
                	$time = $a.find('.video-time').text(),
                    $img = $a.find('span.yt-thumb-clip img'); //thumbnail
                self.items[i] = {
                    href: $a.attr('href'),
                    title: $title.trim(),
                    time: $time,
                    thumbnail: $img.attr('src'),
                    urlObj: url.parse($a.attr('href'), true) //parse our URL and the query string as well
                };
            });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end("{data:{items:"+JSON.stringify(self.items)+"}}");
      }
    });
  });
});
  
app.get('/tube', function(req, res){
  //Tell the request that we want to fetch youtube.com, send the results to a callback function
  request({uri: 'http://www.youtube.com/google/videos'}, function(err, response, body){
    var self = this;
    self.items = new Array();//I feel like I want to save my results in an array
    //Just a basic error check
    if(err && response.statusCode !== 200){console.log('Request error.');}
    //Send the body param as the HTML code we will parse in jsdom
    //also tell jsdom to attach jQuery in the scripts and loaded from jQuery.com
    var result=[];
    jsdom.env({
      html: body,
      scripts: ['https://code.jquery.com/jquery-2.1.1.min.js'],
      done: function(err, window){
        //Use jQuery just as in a regular HTML page
        var $ = window.jQuery;
        var $body = $('body');
        var $videos = $body.find('.channels-content-item');
           $videos.each(function (i, item) { 
                var $a = $(item).find('.yt-lockup-thumbnail a'),
                	$title = $(item).find('.yt-lockup-title a').text(),
                	$time = $a.find('.video-time').text(),
                    $img = $a.find('span.yt-thumb-clip img'); //thumbnail               
					 //and add all that data to my items array
                self.items[i] = {
                    href: $a.attr('href'),
                    title: $title.trim(),
                    time: $time,
                    thumbnail: $img.attr('src'),
                    urlObj: url.parse($a.attr('href'), true) //parse our URL and the query string as well
                };
            });       
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end("{data:{items:"+JSON.stringify(self.items)+"}}");
      }
    });
  });
});

//Pass the video id to the video view
app.get('/watch/:id', function(req, res){
	res.render('video', {
		title: 'تماشا',
        vid: req.params.id
    });
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

app.set('port', process.env.PORT || 2828);

var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});
