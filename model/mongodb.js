var mongoose = require('mongoose');
var log = require('../lib/logger');

//var dbUri = 'mongodb://localhost/naviam';
var dbUri = 'mongodb://rmuser:kXc3GX2cSvkj0@ds027519.mongolab.com:27519/naviam';
mongoose.connect(dbUri);

mongoose.connection.on('connected', function() {
	log.info('Mongoose connected to ' + dbUri);
});

mongoose.connection.on('error', function(error) {
	log.emergency('Mongoose connection error: ' + error);
});

mongoose.connection.on('disconnected', function() {
	log.info('Mongoose disconnected.');
});

process.on('SIGINT', function() {
	mongoose.connection.close(function() {
		log.info('Mongoose disconnected through app termination.');
		process.exit(0);
	});
});