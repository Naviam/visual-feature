module.exports = function (app, github, passport, database) {
	var mongoose = require('mongoose');
	var userModel = require('../model/user');
	var GitHubStrategy = require('passport-github').Strategy;

	var User = mongoose.model('User');

	app.set('GITHUB_CLIENT_ID', process.env.githubClientId || "d24dfef0f98062c793f6");
	app.set('GITHUB_CLIENT_SECRET', process.env.githubSecretKey || "e5fe11d7e985757ebf8af9d48392b8f8077d1fb9");
	app.set('GITHUB_CALLBACK_URL', process.env.githubCallbackUrl || "http://localhost:3000/auth/github/callback");

	passport.serializeUser(function(user, done) {
		console.log("user id: " + user.id);
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function (err, user) {
			console.log("find error: " + err); 
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
		console.log('accessToken: ' + accessToken);
		console.log('refreshToken: ' + refreshToken);
		console.log('params: ' + params);
		console.log('profile: ' + profile);
		console.log('done: ' + done);
		// asynchronous verification, for effect...
		process.nextTick(function () {  
			// To keep the example simple, the user's GitHub profile is returned to
			// represent the logged-in user.  In a typical application, you would want
			// to associate the GitHub account with a user record in your database,
			// and return that user instead.
			var user = new User( {
				email: profile._json.email,
				name: profile.displayName,
				login: profile.login,
				lastLogin: Date.now(),
				githubAccessToken: accessToken
			});
			user.save();
			console.log("received accessToken from github: " + accessToken);
			github.authenticate({
				type: "oauth",
				token: accessToken
			});
			return done(null, user);
		});
		// User.findOrCreate({ githubId: profile.id }, function (err, user) {
		//   return done(err, user);
		// });
	}));

	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/');
	});
	app.get('/auth/github', passport.authenticate('github'));
	app.get('/auth/github/callback', 
	passport.authenticate('github', { failureRedirect: '/' }),
		function(req, res) {
			// Successful authentication, redirect home.
			console.log(req.user + " user has been successfully authenticated.");
			req.session.loggedIn = true;
			req.session.user = req.user;
			res.redirect('/1');
		});
};