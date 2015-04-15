var express = require('express');
var session = require('express-session');
var mongo = require('./db-service.js')


var router = express.Router();

router.get('/design', function(req, res, next){
	mongo.find(res, mongo.db, 'models', {type:"model"}, {}, function(data){
		res.render('design', {models: data, session : req.session});
	})
});


router.all('/saveSketch', function(req, res, next){
	mongo.save(res, mongo.db, 'models', req.body, function(data){
		console.log(data);
		res.send({ok: 'saved'});
	});
})

router.get('/loadModels', function(req, res, next){
	mongo.find(res, mongo.db, 'models', {type:"model", account: req.query.account, name:req.query.model}, {}, function(data){
		res.json(JSON.stringify(data));
	})
});


router.get('/loadSingleSketch', function(req, res, next){
	mongo.find(res, mongo.db, 'models', req.query, {}, function(data){
		console.log(req.session);
		if(req.session){
			console.log('here');
			req.session.sketch=data[0];	
		}
	
		console.log(data[0]);
		res.json(JSON.stringify(data[0]));
	})
})

router.get('/loadSketchList', function(req, res, next){
	console.log(req.query);
	mongo.find(res, mongo.db, 'models', {type:"sketch", account:req.query.account}, {_id:1, name:1}, function(data){
		res.json(JSON.stringify(data));
	})
})

module.exports = router;