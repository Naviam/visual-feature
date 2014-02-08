var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
	email: { type: String, index: true },
	name: String,
	password: String,
	createdOn: { type: Date, default: Date.now },
	lastLogin: Date,
	github: {
		id: { type: Number, index: true },
		login: String,
		accessToken: String
	}
});

mongoose.model('User', userSchema);