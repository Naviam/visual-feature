var GitHubApi = require("github");
var mongoose  = require('mongoose');
var util      = require('util');
var client    = require('../lib/redis');
var db        = require('../lib/mongodb');
var log       = require('../lib/logger');
var schema    = require('../model/schema');
var User      = mongoose.model('User');
var github    = {};

module.exports = function (app) {
	this.githubAuthenticate = function(req, res) {
		debugger;
		log.debug("User has been successfully authenticated: %s", util.inspect(req.user));
		github = new GitHubApi(
		{
			version: "3.0.0", 
			timeout: 5000,
			debug: true
		});
		github.authenticate({
			type: 'oauth',
			token: req.user._doc.github.accessToken
		});
		req.session.regenerate(function(){
			req.session.user = req.user;
			res.redirect('/dashboard');
		});
	};

	app.get('/', function(req, res) {
        res.render('index', { title: 'Naviam' });
    });
    app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
    app.get('/login/github-enterprise', function(req, res) {
        res.render('login', { title: 'Naviam | Login' });
    });
    app.post('/login/github-enterprise', function (req, res, next) {
		var domain = req.body.domain, username = req.body.username, password = req.body.password; //12iBYLzcPR2Ug
		log.info('domain %s username %s password %s', domain, username, password);
		User.findOne(
		{
			'github.enterprise.username': username,
			'github.enterprise.domain': domain
		},
		function(err, user) {
			if (err) { res.redirect('/login/github-enterprise'); }
			if (!user) {
				log.info('User has not been found.');
				github = new GitHubApi(
				{
					version: "3.0.0", 
					timeout: 5000, 
					protocol: 'http',
					url: '/api/v3',
					port: 80,
					host: domain,
					debug: true
				});
				github.authenticate({
					type: 'basic',
					username: username,
					password: password
				});
                res.redirect('/dashboard');
			}
		});
	});
	app.get('/dashboard', function(req, res) {
		github.user.get({}, function(err, usr) {
            if (err) log.error(util.inspect(err));
            log.debug(util.inspect(usr));
            github.user.getOrgs({}, function(err, orgs) {
                if (err) log.error(util.inspect(err));
                log.debug(util.inspect(orgs));
                res.render('dashboard', 
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
		github.repos.getFromOrg({org: orgName}, function (err, repos) {
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
        github.repos.getCommits(
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
		github.pullRequests.getAll(
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
        github.repos.compareCommits(
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

	// app.get('/repositories/:org', function(req, res) {
	// 	var orgName = req.params.org;
	// 	log.info("get repos for org: " + orgName);
	// 	github.repos.getFromOrg({org: orgName}, function (err, repos) {
	// 		if (err) {
 //                log.error("get from org error: " + err);
 //            }
	// 		res.json(repos);
	// 	});
	// });

	// app.get('/stories/:owner/:repo', function (req, res) {
	// 	var repoName = req.params.repo;
	// 	var owner = req.params.owner;
	// 	log.info("get stories for repo: " + repoName + " and owner: " + owner);
	// 	github.pullRequests.getAll({ user: owner, repo: repoName }, function (err, stories) {
	// 		if (err) {
 //                log.error("get pull requests error: " + err);
 //            }
 //            log.info("get stories from repo error: " + err);
	// 		res.json(stories);
	// 	});
	// });

	function ensureAuthenticated(req, res, next) {
		if (req.session.user) { return next(); }
		res.redirect('/');
	}

	return this;
};