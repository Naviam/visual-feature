module.exports = function (app, passport) {
	var db = require('../model/db');
	var mongoose = require('mongoose');
	var schema = require('../model/schema');

	var User = mongoose.model('User');
	var GitHubApi = require("github");
	var github = new GitHubApi(
	{
		version: "3.0.0", 
		timeout: 5000
	});
	var githubEnterprise = new GitHubApi(
	{
		version: "3.0.0", 
		timeout: 5000, 
		schema: 'http',
		port: 80,
		debug: true
	});
	var auth = require('./auth')(app, github, passport, db);
	var views = require('./views');
	var accounts = require('./accounts')(app, github, passport, db);

	app.get('/', views.index);

	app.get('/repositories/:org', ensureAuthenticated, function(req, res) {
		// console.log("GOT RES?", orgs);
		var orgName = req.params.org;
		console.log("get repos for org: " + orgName);
		github.repos.getFromOrg({org: orgName}, function (err, repos) {
			console.log("get from org error: " + err);
			res.json(repos);
		});
	});
	app.get('/stories/:owner/:repo', ensureAuthenticated, function (req, res) {
		var repoName = req.params.repo;
		var owner = req.params.owner;
		console.log("get stories for repo: " + repoName + " and owner: " + owner);
		github.pullRequests.getAll({ user: owner, repo: repoName }, function (err, stories) {
			console.log("get stories from repo error: " + err);
			res.json(stories);
		});
	});

	app.namespace('/gitent', function() {
		app.get('/login', views.login);
		app.post('/login', function (req, res, next) {
			var domain = req.body.domain;
			var username = req.body.username;
			var password = req.body.password; //12iBYLzcPR2Ug
			console.log(req.body.domain);
			console.log(req.body.username);
			console.log(req.body.password);
			User.findOne(
			{
				'github.enterprise.username': username,
				'github.enterprise.domain': domain
			},
			function(err, user) {
				if (err) { res.redirect('/gitent/login'); }
				if (!user) {
					console.log('User has not been found.');
					githubEnterprise = new GitHubApi(
					{
						version: "3.0.0", 
						timeout: 5000, 
						protocol: 'http',
						url: '/api/v3',
						port: 80,
						host: domain,
						debug: true
					});
					githubEnterprise.authenticate({
						type: 'basic',
						username: username,
						password: password
					});
					console.log('before user get');
					githubEnterprise.user.get({}, function(err, usr) {
			            console.log('I am here!');
			            console.log(usr);
			            githubEnterprise.user.getOrgs({}, function(err, orgs) {
			                console.log(err);
			                console.log(orgs);
			                //res.send('Hooray!');
			                res.render('dashboard_new', { title: 'Naviam | Dashboard', user: usr, orgs: orgs });
			            });
			        });
				}
			});
		});
		app.get('/repositories/:org', function(req, res) {
			var orgName = req.params.org;
			console.log("get repos for org: " + orgName);
			githubEnterprise.repos.getFromOrg({org: orgName}, function (err, repos) {
				console.log("get from org error: " + err);
				res.json(repos);
			});
		});
		app.get('/stories/:owner/:repo', function(req, res) {
			var repoName = req.params.repo;
			var owner = req.params.owner;
			console.log("get stories for repo: " + repoName + " and owner: " + owner);
			githubEnterprise.pullRequests.getAll({ user: owner, repo: repoName }, function (err, stories) {
				console.log("get stories from repo error: " + err);
				res.json(stories);
			});
		});
	});

	//app.resource('/auth', auth);

	//app.get('/', routes.index);
	//app.get('/dashboard', ensureAuthenticated, routes.dashboard);
	
	//app.get('/clean', routes.clean);
	//app.post('/sns', sns.sns);

	// Simple route middleware to ensure user is authenticated.
	//   Use this route middleware on any resource that needs to be protected.  If
	//   the request is authenticated (typically via a persistent login session),
	//   the request will proceed.  Otherwise, the user will be redirected to the
	//   login page.
	function ensureAuthenticated(req, res, next) {
		if (req.session.user) { return next(); }
		res.redirect('/');
	}
};