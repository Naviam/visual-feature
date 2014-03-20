var mongoose = require('mongoose');

var organizationSchema = new mongoose.Schema({
	id: { type: Number, index: true },
	name: String
});

var integrationTypes = 'github github-enterprise bitbucket'.split(' ');

var accountSchema = new mongoose.Schema({
	name: String,
	createdOn: { type: Date, default: Date.now },
	createdBy: String,
	integration: {
		type: { type: String, enum: integrationTypes, index: true },
		domain: String,
		organizations: [organizationSchema]
	}
});

mongoose.model('Account', accountSchema);

var userSchema = new mongoose.Schema({
	email: { type: String, index: true },
	fullname: String,
	password: String,
	createdOn: { type: Date, default: Date.now },
	lastLogin: Date,
	auth: {
		id: { type: Number, index: true },
		type: { type: String, enum: integrationTypes, index: true },
		domain: String,
		username: { type: String, index: true },
		email: String
	},
	accounts: [accountSchema]
});

mongoose.model('User', userSchema);

var environmentSchema = new mongoose.Schema({
	shortName: String,
	fullName: String,
	branch: String,
	cssClass: String
});

var projectSchema = new mongoose.Schema({
	name: String,
	createdOn: { type: Date, default: Date.now },
	environments: [environmentSchema]
});

mongoose.model('Project', projectSchema);