var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var nodefu  = require('nodefu')

var Db = require('./node_modules/mongodb').Db,
    Server = require('mongodb').Server;

var mongoDB = new Db('docs', new Server('localhost',  27017, {}), {safe: false});

var mongoFind = function(theDB, theCollection, theQuery, theAction){
  mongoDB.open(function(err, db){
    if(err){
      console.log(err);
      res.send(err);
      return;
    }
    
    db.collection('models', function(err, collection){
      if(err){
        db.close();
        console.log(err);
        res.send(err);
        return;
      }

      collection.find(theQuery).toArray(function(err, data){
        if(err){
          res.send(err);
          return;
        }

        theAction(data);
        db.close();
      })
    });

    
  });

}

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json({type: '*/*'}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(nodefu());

var jsonParser = bodyParser.json({type: '*/*'});

app.get('/saveSketch', jsonParser, function(req, res, next){
  console.log(req.query);
  res.send({ok: "saved", whatvedone: req.query});
})

app.get('/', function(req, res,next){
  mongoFind(mongoDB, 'models', {type:"model"}, function(data){
    res.render('index', {models: data});
  })
});

app.post('/uploadImage', function(req, res, next){
    req.files.file_data.toFile(path.join(__dirname, 'public/images'),
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

app.get('/loadModels', function(req, res, next){
  mongoFind(mongoDB, 'models', {type:"model"}, function(data){
    console.log(data);
    res.json(JSON.stringify(data));
  })
});


app.get('/loadSketch', function(req, res, next){
  
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
    error: {}
  });
});


module.exports = app;
