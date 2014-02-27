var mongoose = require('mongoose');

var organizationSchema = new mongoose.Schema({
	id: { type: Number, index: true },
	name: String
});

var accountSchema = new mongoose.Schema({
	name: String,
	createdOn: { type: Date, default: Date.now },
	createdBy: String,
	github: {
		organizations: [organizationSchema]
	}
});

mongoose.model('Account', accountSchema);

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
	},
	accounts: [accountSchema]
});

mongoose.model('User', userSchema);