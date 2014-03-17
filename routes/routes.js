module.exports = function (app, passport) {
    // databases
    var client = require('../model/redis');
	var db = require('../model/mongodb');
	var mongoose = require('mongoose');
	var schema = require('../model/schema');

    // schemas
	var User = mongoose.model('User');

    // logger
    var log = require('../lib/logger');

    // github
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
		var orgName = req.params.org;
		log.info("get repos for org: " + orgName);
		github.repos.getFromOrg({org: orgName}, function (err, repos) {
			if (err) {
                log.error("get from org error: " + err);
            }
			res.json(repos);
		});
	});
	app.get('/stories/:owner/:repo', ensureAuthenticated, function (req, res) {
		var repoName = req.params.repo;
		var owner = req.params.owner;
		log.info("get stories for repo: " + repoName + " and owner: " + owner);
		github.pullRequests.getAll({ user: owner, repo: repoName }, function (err, stories) {
			if (err) {
                log.error("get pull requests error: " + err);
            }
            log.info("get stories from repo error: " + err);
			res.json(stories);
		});
	});

    app.get('/test', function(req, res, next) {
        client.set('github-github.servicechannel.com-test', 'test', redis.print);
    });

    app.namespace('/projects', function() {

    });

    app.namespace('/api', function() {
        // Accounts API
        app.namespace('/accounts', function() {
            // get single account by id
            app.get('/:account', function(req, res, next) {

            });
            // create new account
            app.post('/', function(req, res, next) {

            });
            // update account details
            app.put('/:account', function(req, res, next) {

            });
            // remove account (close it)
            app.delete('/:account', function(req, res, next) {

            });

            // Account Users API
            app.namespace('/users', function() {

            });

            // Account Projects API
            app.namespace('/projects', function() {
                // get all projects for user's account
                app.get('/', function(req, res, next) {

                });
                // get single project by id
                // we download everything related to the project as single json object
                app.get('/:project', function(req, res, next) {

                });
                // create new project
                app.post('/', function(req, res, next) {

                });
                // remove project
                app.delete('/:project', function(req, res, next) {

                });
                // Project Webhooks API (receivers)
                app.namespace('/webhooks', function() {
                    // web hook endpoint to receive updates from github
                    app.post('/github/:project', function(req, res, next) {

                    });
                    // web hook endpoint to receive updates from pivotal tracker
                    app.post('/pivotal/:project', function(req, res, next) {

                    });
                });
            });
        });
    });

	app.namespace('/gitent', function() {
		app.get('/login', views.login);
		app.post('/login', function (req, res, next) {
			var domain = req.body.domain;
			var username = req.body.username;
			var password = req.body.password; //12iBYLzcPR2Ug
			log.info(req.body.domain);
			log.info(req.body.username);
			log.info(req.body.password);
			User.findOne(
			{
				'github.enterprise.username': username,
				'github.enterprise.domain': domain
			},
			function(err, user) {
				if (err) { res.redirect('/gitent/login'); }
				if (!user) {
					log.info('User has not been found.');
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
			log.info('loading dashboard page with github enterprise');
			githubEnterprise.user.get({}, function(err, usr) {
                log.error(err);
                log.debug(usr);
                githubEnterprise.user.getOrgs({}, function(err, orgs) {
                    log.error(err);
                    log.debug(orgs);
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
			log.info("get repos for org: " + orgName);
			githubEnterprise.repos.getFromOrg({org: orgName}, function (err, repos) {
				if (err) {
                    log.error("get from org error: " + err);
                }
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
                if (err) {
                    log.error("get branch error: " + err);
                }
                log.info(JSON.stringify(result));
                res.json(result);
            });
        });
		app.get('/stories/:owner/:repo', function(req, res) {
			var repoName = req.params.repo;
			var owner = req.params.owner;
			log.info("get stories for repo: " + repoName + " and owner: " + owner);
			githubEnterprise.pullRequests.getAll(
                {
                    user: owner,
                    repo: repoName,
                    per_page: 100
                },
            function (err, stories) {
				log.info("get stories from repo error: " + err);
				res.json(stories);
			});
		});
        app.get('/compare/:owner/:repo/:base/:head', function(req, res) {
            log.info(req.params.owner);
            log.info(req.params.repo);
            log.info(req.params.base);
            log.info(req.params.head);
            githubEnterprise.repos.compareCommits(
            {
                user: req.params.owner,
                repo: req.params.repo,
                base: req.params.base,
                head: req.params.head
            }, 
            function(e, compareResult) {
                if (e) {
                    log.error(e);
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