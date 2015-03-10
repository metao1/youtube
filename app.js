var   express = require('express')
    , jsdom = require('jsdom')
    , request = require('request')
    , url = require('url')
    , youtubedl = require('youtube-dl')
    , http = require('http')
    , path = require('path')
    , fs = require('fs');

var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

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

app.use('/', routes);
app.use('/users', users);



app.post('/search' ,function(req,res){
    
    var q = req.body.q
    if(!q){
       return;        
    } 
    console.log('SERACHING FOR=>' +q ); 
                request({uri: 'https://www.googleapis.com/youtube/v3/search?type=video&maxResults=50&part=snippet&q='+q+'&key=AIzaSyARSABX27_wqgECdGT9QPWMXNiFuqKU9VI'}, function(err, response, body){                
                var self  = this;
                self.items = new Array();
                var items = JSON.parse(body);
                var siahItems= items.items;    
                for (var i=0 ;i< siahItems.length ;i++) {
                    self.items[i] = {
                        href: siahItems[i].id.videoId,
                        title: siahItems[i].snippet.title,
                        time: '',
                        thumbnail: siahItems[i].id.videoId,
                        urlObj: url.parse('http://youtube.com/watch?v='+ siahItems[i].id.videoId, true) //parse our URL and the query string as well
                    };
                }
               
                //We have all we came for, now let's render our view
                res.render('list', {
                    title: 'دنیای ویدیو',
                    items: self.items
                });
                           
                });
       
});

app.get('/download/:id', function(req, res){
    var id = req.params.id;
    var filename = "video_"+guid()+".mp4";
    var video = youtubedl('http://youtube.com/watch?v=' + id,
        ['--max-quality=18']);
    video.on('info', function(info) {
        res.setHeader("Content-Type","video/mp4");
        res.setHeader( "Content-Disposition", "attachment;filename="
        + filename );        
        res.setHeader("Content-Length",info.size);
        video.pipe(res);
    });
});

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

app.get('/tube', function(req, res){
    //Tell the request that we want to fetch youtube.com, send the results to a callback function
    request({uri: 'http://www.youtube.com/google/videos'}, function(err, response, body){
        var self = this;
        self.items = new Array();//I feel like I want to save my results in an array
        //Just a basic error check
        if(err && response.statusCode !== 200){console.log('Request error.');}
        //Send the body param as the HTML code we will parse in jsdom
        //also tell jsdom to attach jQuery in the scripts and loaded from jQuery.com

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
                //We have all we came for, now let's render our view
                res.render('list', {
                    title: 'دنیای ویدیو',
                    items: self.items
                });
            }
        });
    });
});

//Pass the video id to the video view
app.get('/watch/:id/:title', function(req, res){

    res.render('video', {
        title: req.params.title,
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

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
    debug('Express server listening on port ' + server.address().port);
});
