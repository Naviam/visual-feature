var log = require('../lib/logger');

exports.githubAuthenticate = function(req, res) {
	log.debug("User has been successfully authenticated.");
	// github.authenticate({
	// 	type: 'oauth',
	// 	token: accessToken
	// });
	req.session.regenerate(function(){
		req.session.user = req.user;
		res.redirect('/gitent/dashboard');
	});
}

exports.logout = function(req, res) {
	req.logout();
	res.redirect('/');
}