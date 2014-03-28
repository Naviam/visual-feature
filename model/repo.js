var mongoose = require('mongoose');
var schema   = require('./schema');
var log      = require('../lib/logger');
var User     = mongoose.model('User');
var Account  = mongoose.model('Account');

exports.findOrCreateGithubUser = function (github, callback) {
	User.findOne({
		'github.id' : github.id,
		'github.enterprise': github.enterprise
	}, function( err, user) { 
		if(! err) {
			user.lastLogin = Date.now();
			user.github.accessToken = github.accessToken;
			user.save( function( err, user) { log.info(' User saved:', user); });
			callback(err, user);
		}
		else {
			var gh = new GitHubApi().authenticate({
				type: 'oauth',
				token: github.accessToken
			});
			
			// create user
			user = new User({
				email: github.email,
				name: github.name,
				github: {
					id: github.id,
					login: github.login,
					accessToken: github.accessToken
				},
				lastLogin: Date.now()
			});
			user.save();

			// add user accounts
			gh.user.getOrgs({}, function(err, orgs) {
                if (err) log.error(util.inspect(err));
				//log.debug(util.inspect(orgs));
				for (var i = orgs.length - 1; i >= 0; i--) {
					var account = new Account({ createdBy: user._id, name: orgs[i].login });
					user.accounts.push(account);
					user.save();
				}
				callback(err, user);
			});
		}
	});
};

exports.getUserById = function(id, callback) {
	User.findById(id, function (err, user) {
		if (err) {
			log.error("get user by id error: %s", util.inspect(err));
		}
		callback(err, user);
	});
};

exports.createAccount = function(account, callback) {
	var acc = new Account(account);
	acc.save();
};