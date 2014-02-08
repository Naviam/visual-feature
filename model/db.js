var mongoose = require('mongoose');
//var user = require('./model/user');

var dbUri = 'mongodb://localhost/test';
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


// var storySchema = new mongoose.Schema({
//	title: String,
//	description: String,
//	status: String,
//	labels: [String],
//	createdOn: Date,
// 	createdBy: String,
// 	requester: String,
// 	assignee: String,
// 	comments: [String]
// });

// var stageSchema = new mongoose.Schema({
// 	name: String,
// 	stories: [storySchema]
// });

// mongoose.model('Stage', stageSchema);

// var projectSchema = new mongoose.Schema({
// 	name: String,
// 	stages: [stageSchema]
// });

// mongoose.model('Project', projectSchema);