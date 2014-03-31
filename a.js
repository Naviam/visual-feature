//var client         = require('./lib/redis');
var db             = require('./lib/mongodb');
var log            = require('./lib/logger');
var config         = require('./lib/config');
var mongoose       = require('mongoose');
var schema         = require('./model/schema-test');
var Account        = mongoose.model('Account');
var User           = mongoose.model('User');
var SourceProvider = mongoose.model('SourceProvider');

var findOrCreateUser = exports.findOrCreateUser = function (params, callback) {
	User.findOne({
		userId: params.user.id, 
		login:  params.user.login,
		'sourceProvider.domain': params.provider.domain,
		'sourceProvider.name': params.provider.name
	}, function(err, user) {
		if (err) {
			log.error('find user error %s', err);
		}
		if (! user) {
			log.info('User %s has not been found', params.user.login);
			user = new User({
				userId: params.user.id,
				login: params.user.login,
				sourceProvider: {
					domain: params.provider.domain,
					name: params.provider.name,
					protocol: params.provider.protocol,
					port: params.provider.port,
					query: params.provider.query
				}
			});
			user.save(function(error, result) {
				callback(error, result);
			});
		}
		else {
			log.info('User %s has been found', user.login);
			callback(err, user);
			// user.lastLogin = Date.now();
			// user.github.accessToken = params.accessToken;
			// user.save(function(error, result) {
				
			// });
		}
	});
};

var findOrCreateAccount = exports.findOrCreateAccount = function(params, callback) {
	Account.findOne({
		'github.domain': params.domain, 
		'github.organization.id': params.organization.id
	}, function(err, acc) {
		if (err) {
			log.info('error : ', err);
		}
		if (! acc) {
			log.info('Account has not been found');
			acc = new Account({
				name: '',
				createdBy: params.user._id,
				github: {
					domain: params.domain,
					organization: params.organization
				}
			});
			acc.users.push(params.user._id);
			acc.save(function(e, result) {
				log.info('Account %s has been created', acc.name || 'default');
				callback(e, result);
			});	
		}
		else {
			log.info('Account %s has been found', acc.name || 'default');
			if (acc.users.indexOf(params.user._id) >= 0) {
				log.info("User %s was found in this account.", params.user.email);
				callback(null, acc);
			} else {
				log.info("User %s was not found in this account.", params.user.email);
				acc.users.push(params.user._id);
				acc.save(function(e, result) {
					callback(e, result);
				});
			}
		}
	});
};

exports.loginUser = function(params, callback) {
	var self = this;

	// returns account object that includes current user
	findOrCreateUser(params, function(err, user) {
		if (! user.account) {
			// redirect to create account page
			var userParams = {
				user: user, 
				domain: params.domain, 
				organization: params.organization
			};
			findOrCreateAccount(userParams, function(error, account) {
				if (error) {
					log.error(error);
				}
				user.account = account._id;
				user.save(function() {
					User.populate(user, { path: 'account' }, function(error, result) {
						//log.info(user.account._doc);
						callback(error, result);
					});
				});
				
				// Account.populate(account, { path: 'users', model: 'User'}, function(err, acc) {
				//	debugger;
				//	log.info(acc.users);
				// });
				log.info('end of feature.');
			});
		}
		else {
			log.info('account has been found');
			User.populate(user, { path: 'account' }, function(error, result) {
				//log.info(user.account._doc);
				callback(error, result);
			});
		}
	});
};