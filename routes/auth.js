module.exports = function (app, github, passport, database) {
	var mongoose = require('mongoose');
	var schema = require('../model/schema');
	var GitHubStrategy = require('passport-github').Strategy;
    // logger
    var log = require('../lib/logger');

	var User = mongoose.model('User');

	app.set('GITHUB_CLIENT_ID', process.env.githubClientId || "d24dfef0f98062c793f6");
	app.set('GITHUB_CLIENT_SECRET', process.env.githubSecretKey || "e5fe11d7e985757ebf8af9d48392b8f8077d1fb9");
	app.set('GITHUB_CALLBACK_URL', process.env.githubCallbackUrl || "http://localhost:3000/auth/github/callback");

	passport.serializeUser(function(user, done) {
		log.debug("serialize user id: " + user.id);
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		log.debug("entered deserializeUser method");
		log.debug("deserializeUser method params: id = " + id + " and done = "+ done);
		User.findById(id, function (err, user) {
			log.debug("deserialize found error: " + err);
			log.debug("deserialize found user: " + user);
			log.debug("deserialize user.id = " + user.id);
			done(err, user);
		});
	});
	
	passport.use(new GitHubStrategy({
		clientID: app.get('GITHUB_CLIENT_ID'),
		clientSecret: app.get('GITHUB_CLIENT_SECRET'),
		scope: "user,repo",
		callbackURL: app.get('GITHUB_CALLBACK_URL')
	},
	function(accessToken, refreshToken, params, profile, done) {
		log.debug('accessToken: ' + accessToken);
		log.debug('refreshToken: ' + refreshToken);
		log.debug('params: ' + params);
		log.debug('profile: ' + profile);
		log.debug('done: ' + done);
		// asynchronous verification, for effect...
		process.nextTick(function () {
			User.findOne({'github.id': profile.id }, function(err, user) {
				if (user) {
					user.lastLogin = Date.now();
					user.save();
					log.debug('User with github id = ' + profile.id + ' has been found.');
				}
				else {
					log.debug('User with github id = ' + profile.id + ' has NOT been found.');
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
				github.authenticate({
					type: 'oauth',
					token: accessToken // '8eedbd1d8d4ed79d2c08c877e7004ef7a9f56bd3'
				});
				log.debug('call github.authenticate');
				// github.authenticate({
				//	type: 'basic',
				//	username: 'vhatalski',
				//	password: 'UuWi7tJY'
				// });
				return done(null, user);
			});
		});
	}));

	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/');
	});
	app.get('/auth/github', passport.authenticate('github'));
	app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }),
		function(req, res) {
			debugger;
			log.debug("User has been successfully authenticated.");
			req.session.regenerate(function(){
				req.session.user = req.user;
				res.redirect('/accounts/create');
			});
		});
};