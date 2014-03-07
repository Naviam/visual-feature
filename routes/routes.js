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
		debug: false
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
			        res.redirect('/gitent/dashboard');
				}
			});
		});
		app.get('/dashboard', function(req, res) {
			console.log('loading dashboard page with github enterprise');
			githubEnterprise.user.get({}, function(err, usr) {
                console.log(err);
			    console.log(usr);
			    githubEnterprise.user.getOrgs({}, function(err, orgs) {
			        console.log(err);
			        console.log(orgs);
                    res.render('dashboard_new', 
                        {
                            title: 'Naviam | Dashboard',
                            user: usr, 
                            orgs: orgs
                        });
			    });
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
        app.get('user/:owner/repo/:repo/branch/:branch', function(req, res) {
            var repoName = req.params.repo;
            var branch = req.params.branch;
            var owner = req.params.owner;
            var self = this;
            self.currentLink = '';
            //while (githubEnterprise.hasNextPage(self.currentLink))
            githubEnterprise.repos.getCommits(
            {
                user: owner,
                repo: repoName,
                sha: branch,
                per_page: 100
            },
            function(err, result) {
                console.log("get branch error: " + err);
                console.log(JSON.stringify(result));
                res.json(result);
            });
        });
		app.get('/stories/:owner/:repo', function(req, res) {
			var repoName = req.params.repo;
			var owner = req.params.owner;
			console.log("get stories for repo: " + repoName + " and owner: " + owner);
			githubEnterprise.pullRequests.getAll(
                {
                    user: owner,
                    repo: repoName,
                    per_page: 100
                },
            function (err, stories) {
				console.log("get stories from repo error: " + err);
				res.json(stories);
			});
		});
        app.get('/compare/:owner/:repo/:base/:head', function(req, res) {
            console.log(req.params.owner);
            console.log(req.params.repo);
            console.log(req.params.base);
            console.log(req.params.head);
            githubEnterprise.repos.compareCommits(
            {
                user: req.params.owner,
                repo: req.params.repo,
                base: req.params.base,
                head: req.params.head
            }, 
            function(e, compareResult) {
                if (e) {
                    console.log(e);
                }
                res.json(compareResult);
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