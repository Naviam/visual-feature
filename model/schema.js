var mongoose = require('mongoose');

var protocols = 'http https'.split(' ');
var accessTypes = 'oauth basic'.split(' ');

var environmentSchema = new mongoose.Schema({
	name: String,
	branch: String,
	color: String,
	createdOn: { type: Date, default: Date.now }
});

var sourceProviderSchema = new mongoose.Schema({
	name: { type: String, index: true },
	domain: { type: String, lowercase: true, index: {unique: true} },
	protocol: { type: String, lowercase: true, enum: protocols },
	port: { type: Number, min: 1, max: 65535 },
	query: String
});

mongoose.model('SourceProvider', sourceProviderSchema);

var projectSchema = new mongoose.Schema({
	name: String,
	createdOn: { type: Date, default: Date.now },
	environments: [environmentSchema]
});

mongoose.model('Project', projectSchema);

var accountSchema = new mongoose.Schema({
	name: String,
	created: {
		on: { type: Date, default: Date.now },
		by: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}
	},
	users: [userSchema],
	projects: [projectSchema],
	sourceProvider: { type: mongoose.Schema.Types.ObjectId, ref: 'SourceProvider' }
});

mongoose.model('Account', accountSchema);

var userSchema = new mongoose.Schema({
	userId: { type: Number, index: true },
	login: { type: String, index: true },
	accessToken: String,
	accessType: { type: String, lowercase: true, enum: accessTypes },
	createdOn: { type: Date, default: Date.now },
	defaultAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
	// accounts: [accountSchema],
	sourceProvider: { type: mongoose.Schema.Types.ObjectId, ref: 'SourceProvider' }
});

mongoose.model('User', userSchema);