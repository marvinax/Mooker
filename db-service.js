var Db = require('mongodb').Db,
	Server = require('mongodb').Server,
	mongoDB = new Db('docs', new Server('localhost',  27017, {}), {safe: false});

var mongoOpen = function(theDB, theCollection, theAction){
	theDB.open(function(err, db){
		if(err){
			console.log(err);
			res.send(err);
			return;
		}
		db.collection(theCollection, function(err, collection){
			if(err){
				db.close();
				console.log(err);
				res.send(err);
				return;
			}
			theAction(db, collection);
		})
	})
}

var mongoFind = function(res, theDB, theCollection, theQuery, theKey, theAction){
	mongoOpen(theDB, theCollection, function(db, collection){
		collection.find(theQuery, theKey).toArray(function(err, data){
			if(err){
				console.log(err);
				res.send(err);
				db.close();
				return;
			}

			theAction(data);
			db.close();
		})

	})
};

var mongoSave = function(res, theDB, theCollection, theData, theAction){
	mongoOpen(theDB, theCollection, function(db, collection){
		collection.updateOne({name: theData.name}, theData, {upsert : true}, function(err, data){
			if(err){
				console.log(err);
				res.send(err);
				db.close();
				return;
			}

			theAction(data);
			db.close();
		})
	})
}

var mongoCreate = function(res, theDB, theCollection, theData, theKey, theAction){
	mongoOpen(theDB, theCollection, function(db, collection){
		collection.findOne(theKey, {}, function(err, data){
			if(err){
				console.log(err);
				res.send(err);
				db.close();
				return;
			}

			console.log('So...');
			console.log(data);

			if(data){
				res.send({existing : "document exists"});
			} else {
				collection.insertOne(theData, function(err, data){
					if(err){
						console.log(err);
						res.send(err);
						db.close();
						return;
					}

					theAction(data);
					db.close();
				});
			}
		})
	})

}

var services = {find: mongoFind, save:mongoSave, create:mongoCreate, db:mongoDB};

module.exports = services;