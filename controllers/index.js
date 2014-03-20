module.exports = function (app) {
    // databases
    var client = require('../lib/redis');
	var db = require('../lib/mongodb');
	var mongoose = require('mongoose');
	var schema = require('../model/schema');

    // schemas
	var User = mongoose.model('User');

    // logger
    var log = require('../lib/logger');

    // github
	var GitHubApi = require("github");

	app.get('/', function(req, res) {
        res.render('index', { title: 'Naviam' });
    });

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

	app.namespace('/gitent', function() {
		app.get('/login', function(req, res){
            res.render('login', { title: 'Naviam | Login' });
        });
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

	function ensureAuthenticated(req, res, next) {
		if (req.session.user) { return next(); }
		res.redirect('/');
	}
};