var express = require('express');
var session = require('express-session');
var mongo = require('./db-service.js')

var fs = require('fs');
var path = require('path');

var MongoStore = require('connect-mongo')(session);
var crypto = require('crypto');

var router = express.Router();

router.use(session({
    secret: "爱是恒久忍耐，又有恩慈",
    key: "docs",
    cookie: {path: '/', maxAge: 1000 * 60 * 60 * 24 * 30, secure:false},//30 days
    store: new MongoStore({
        db: "docs"
    }),
    resave: true,
    saveUninitialized: true
}));

router.get('/logout', function(req, res){
    req.session.login = undefined;
    req.session.sketch = undefined;
    res.redirect('/design');
})


router.get('/check_logged', function(req, res){
    res.send(req.session.login);
})

router.get('/loadLastEditingSketch', function(req, res){
	res.send(req.session.sketch);
})

router.post('/signup', function(req, res){
    var md5 = crypto.createHash('md5'),
    password = md5.update(req.body.password).digest('hex');

    var user = {
        account: req.body.account,
        password: password,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone
    };

    mongo.create(res, mongo.db, 'users', user, {account:user.account}, function(data){
    	fs.mkdirSync(path.join(__dirname, 'public/images/'+user.account));

    	console.log(data);
    	res.send(data);

    })
});

router.post('/login', function(req, res){
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');

    var login = {
        account : req.body.account,
        password : password
    }

    mongo.find(res, mongo.db, 'users', login, {account:1, name:1}, function(data){
    	if(data[0]){
    		req.session.login = login;
    		console.log(data[0]);
	    	res.send(data[0]);
	    } else {
	    	res.send({mismatched : "no matching user/password record."});
	    }
    })

});

module.exports = router;