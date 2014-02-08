var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
	login: String,
	email: String,
	password: String,
	createdOn: { type: Date, default: Date.now },
	lastLogin: Date,
	githubAccessToken: String
});

mongoose.model('User', userSchema);