var mongoose = require('mongoose');
var schema   = require('./schema');
var log      = require('../lib/logger');
var ObjectId = require('mongoose').Types.ObjectId;
var User     = mongoose.model('User');
var Account  = mongoose.model('Account');
var SourceProvider  = mongoose.model('SourceProvider');

exports.findOrCreateGithubSourceProvider = function(params, callback) {
	SourceProvider.findOne({
		name: params.name, 
		domain: params.domain
	}, function(error, provider) {
		if (! provider) {
			log.info('provider has not been found');
			provider = new SourceProvider({
				name: params.name,
				domain: params.domain,
				protocol: params.protocol || 'https', 
				query: params.query, 
				port: params.port || 443
			});
			provider.save(function(saveError, newProvider) {
				if (saveError) {
					log.error('error to save provider: %s', saveError);
				}
				callback(saveError, newProvider);
			});
		} else {
			callback(null, provider);
		}
	});
};

var findOrCreateGithubUser = exports.findOrCreateGithubUser = function (params, callback) {
	User.findOne({
		userId: params.profile.id, 
		login:  params.profile.username,
		sourceProvider: new ObjectId(params.provider.id)
	})
	//.populate('sourceProvider')
	//.lean()
	.exec(function(err, user) {
		if (err) {
			log.error('find user error %s', err);
		}
		if (! user) {
			log.info('User %s has not been found', params.profile.username);
			user = new User({
				userId: params.profile.id,
				login: params.profile.username,
				accessToken: params.accessToken,
				accessType:  params.accessType || 'oauth',
				sourceProvider: params.provider
			});
			user.save(function(error, result) {
				if (error) {
					log.error('error occured when we tried to create new user: %s', error);
				}
				findOrCreateGithubUser(params, callback);
			});
		}
		else {
			log.info('User %s has been found', user.login);
			//log.info('User provider domain is %s', user.sourceProvider.domain);
			callback(null, user);
		}
	});
};

exports.findUserById = function (id, callback) {
	User.findById(id, callback);
};

exports.findSourceProviderById = function (id, callback) {
	SourceProvider.findById(id, callback);
};