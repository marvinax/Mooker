var express = require('express');
var session = require('express-session');

var fs = require('fs');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var nodefu  = require('nodefu')


var sketchStoreRouters = require('./sketch-store');
var userStoreRouters = require('./user-store');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(bodyParser.raw());
app.use(bodyParser.text());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(sketchStoreRouters);
app.use(userStoreRouters);

app.get('/', function(req, res, next){
  res.render('index');
})

app.post('/uploadImage/', nodefu(), function(req, res, next){
  console.log(req.session);
  req.files.file_data.toFile(path.join(__dirname, 'public/images/'+req.session.login.account),
    function(err, data){
      if(!err){
        console.log('file uploaded successfully');
        res.send({
          res : 'ok',
          file : path.basename(data)
        });            
      }
    })
});

app.get('/userImageList/:account', function(req, res, next){
  console.log(fs.readdirSync(path.join(__dirname, 'public/images/'+req.params.account)));
  res.send(fs.readdirSync(path.join(__dirname, 'public/images/'+req.params.account)));
})

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
    console.log(err.stack);
    res.send({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send({
    message: err.message,
    error: err
  });
});


module.exports = app;
