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

var mongoFind = function(res, theDB, theCollection, theQuery, theAction){
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
          console.log(err);
          res.send(err);
          db.close();
          return;
        }

        theAction(data);
        db.close();
      })
    });
  });
};

var mongoSave = function(res, theDB, theCollection, theData){
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
      collection.insertOne(theData, {safe : true}, function(err, data){
        console.log(data.ops);
        db.close();
      })
    })
  })
}

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.raw());
app.use(bodyParser.text());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.all('/saveSketch', function(req, res, next){
  console.log(req.body);
  mongoSave(res, mongoDB, 'models', req.body);
  res.send({ok: 'saved'});
})

app.get('/', function(req, res, next){
  mongoFind(res, mongoDB, 'models', {type:"model"}, function(data){
    res.render('index', {models: data});
  })
});




app.post('/uploadImage', nodefu(), function(req, res, next){
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
  mongoFind(res, mongoDB, 'models', {type:"model"}, function(data){
    res.json(JSON.stringify(data));
  })
});


app.get('/loadSingleSketch', function(req, res, next){
  mongoFind(res, mongoDB, 'models', req.query, function(data){
    console.log(data[0]);
    res.json(JSON.stringify(data[0]));
  })
})

app.get('/loadSketchList', function(req, res, next){
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

      collection.find({type:"sketch"}, {_id:1, name:1}).toArray(function(err, data){
        if(err){
          console.log(err);
          res.send(err);
          return;
        }

        res.json(JSON.stringify(data));
        db.close();
      })
    });
  });
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
