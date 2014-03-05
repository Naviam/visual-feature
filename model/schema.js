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
		accessToken: String,
		enterprise: {
			username: { type: String, index: true },
			password: String
		}
	},
	accounts: [accountSchema]
});

mongoose.model('User', userSchema);

var commitSchema = new mongoose.Schema({
	id: String
});

var projectSchema = new mongoose.Schema({
	name: String,
	commits: [commitSchema]
});

// var storySchema = new mongoose.Schema({
//	title: String,
//	description: String,
//	status: String,
//	labels: [String],
//	createdOn: Date,
//	createdBy: String,
//	requester: String,
//	assignee: String,
//	comments: [String]
// });

// var stageSchema = new mongoose.Schema({
//	name: String,
//	stories: [storySchema]
// });

// mongoose.model('Stage', stageSchema);

// var projectSchema = new mongoose.Schema({
//	name: String,
//	stages: [stageSchema]
// });

// mongoose.model('Project', projectSchema);