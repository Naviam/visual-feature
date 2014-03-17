var mongoose = require('mongoose');
var log = require('./logger');
var config = require('./config');

log.info('connecting to mongodb', { url: config.get('mongodb:url') });
mongoose.connect(config.get('mongodb:url'));

mongoose.connection.on('connected', function() {
	log.info('Mongoose connected to ', { url: config.get('mongodb:url') });
});

mongoose.connection.on('error', function(error) {
	log.emergency('Mongoose connection error: ', { error: error });
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