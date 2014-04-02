var GitHubApi = require("github");
var log       = require('../lib/logger');

exports.get = function (p) {
	var query = "/api/v3";
	if (p.sourceProvider.domain == "api.github.com") {
		query = null;
	}
	var github = new GitHubApi({
		version:    "3.0.0",
		protocol:   p.sourceProvider.protocol,
		port:       p.sourceProvider.port,
		host:       p.sourceProvider.domain,
		url:      query,
		//pathPrefix: query,
		debug:      true
	});
	if (p.user.accessType == "oauth") {
		github.authenticate({
			type:  p.user.accessType,
			token: p.user.accessToken
		});
	} else if (p.user.accessType == "basic") {
		github.authenticate({
			type:     p.user.accessType,
			username: p.user.username,
			password: p.user.password
		});
	}
	return github;
};