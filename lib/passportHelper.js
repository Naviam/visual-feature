var mongoose = require('mongoose');
var schema   = require('../model/schema');
var log      = require('./logger');
var util     = require('util');

var User = mongoose.model('User');

exports.serializeUser = function (user, done) {
	log.debug("serialize user %s", util.inspect(user));
	done(null, user.id);
};

exports.deserializeUser = function (id, done) {
	log.debug("deserialize user with id %s", id);
	User.findById(id, function (err, user) {
		if (err) {
			log.error("deserialize found error: %s", util.inspect(err));
		}
		log.debug("deserialize found user: %s", util.inspect(user));
		log.debug("deserialize user.id %s", user.id);
		done(err, user);
	});
};

exports.obtainGithubAccessToken = function(accessToken, refreshToken, profile, done) {
	log.debug('retrieved github accessToken %s and refreshToken %s with the following profile: %s ', 
		accessToken, refreshToken, profile);
	process.nextTick(function () {
		User.findOne({'github.id': profile.id }, function(err, user) {
			if (user) {
				user.lastLogin = Date.now();
				user.save();
				log.debug('User with github id %d has been found.', profile.id);
			}
			else {
				log.debug('User with github id %d has NOT been found.', profile.id);
				user = new User({
					email: profile._json.email,
					name: profile.displayName,
					github: {
						id: profile.id,
						login: profile.username,
						accessToken: accessToken
					},
					lastLogin: Date.now()
				});
				user.save();
			}
			return done(null, user);
		});
	});
};