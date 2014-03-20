module.exports = function(session, config) {
	var GitHubApi = require('github');
	if (session.authType == 'github') {
		var github = new GitHubApi(
		{
			version: "3.0.0", 
			timeout: 5000
		});
		github.authenticate({
			type: "oauth",
			// token: options.token
			key: config.get('GITHUB_CLIENT_ID'),
			secret: config.get('GITHUB_CLIENT_SECRET')
		});
		return github;
	}
	else if (session.authType == 'githubEnterprise') {
		var githubEnterprise = new GitHubApi({
			version: "3.0.0", 
			timeout: 5000, 
			protocol: protocol,
			url: '/api/v3',
			port: 80,
			host: domain,
			debug: true
		});
		githubEnterprise.authenticate({
			type: 'basic',
			username: session.user.github.username,
			password: session.user.github.password
		});
		return githubEnterprise;
	}
};