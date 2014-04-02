var repo     = require('../model/repo');
var log      = require('../lib/logger');
var util     = require('util');

exports.serializeUser = function (user, done) {
	log.info("serialize user %s", user.id);
	done(null, user.id);
};

exports.deserializeUser = function (id, done) {
	log.info("deserialize user with id %s", id);
	repo.findUserById(id, function (err, user) {
		if (err) {
			log.error("deserialize user error: %s", util.inspect(err));
		} else {
			log.info("deserialize user.id %s", user.id);
			done(err, user);
		}
	});
};

exports.obtainGithubAccessToken = function(accessToken, refreshToken, profile, done) {
	log.info('retrieved github accessToken %s and refreshToken %s with the following profile: %s ', 
		accessToken, refreshToken, profile);
	process.nextTick(function () {
		repo.findOrCreateGithubSourceProvider({ name: 'github', domain: 'api.github.com'}, function(error, provider) {
			if (error) {
				log.error('error getting provider: %s', error);
			}
			else {
				var params = { provider: provider, accessType: 'oauth', accessToken: accessToken, refreshToken: refreshToken, profile: profile };
				repo.findOrCreateGithubUser(params, function(err, user) {
					return done(err, user);
				});
			}
		});
	});
};