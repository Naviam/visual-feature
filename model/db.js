var mongoose = require('mongoose');
//var user = require('./model/user');

var dbUri = 'mongodb://localhost/naviam';
mongoose.connect(dbUri);

mongoose.connection.on('connected', function() {
	console.log('Mongoose connected to ' + dbUri);
});

mongoose.connection.on('error', function(error) {
	console.log('Mongoose connection error: ' + error);
});

mongoose.connection.on('disconnected', function() {
	console.log('Mongoose disconnected.');
});

process.on('SIGINT', function() {
	mongoose.connection.close(function() {
		console.log('Mongoose disconnected through app termination.');
		process.exit(0);
	});
});