var GitHubApi = require("github");
var gh        = require("../lib/githubHelper");
var mongoose  = require('mongoose');
var util      = require('util');
var client    = require('../lib/redis');
var db        = require('../lib/mongodb');
var log       = require('../lib/logger');
var repo      = require('../model/repo');
var schema    = require('../model/schema');
var User      = mongoose.model('User');

module.exports = function (app) {
	this.githubAuthenticate = function(req, res) {
		log.info("User has been successfully authenticated: %s", req.user.login);
		log.info("User has provider: %s", req.user.sourceProvider);
		repo.findSourceProviderById(req.user.sourceProvider, function (error, provider) {
			if (error) {
				log.error('error occured when tried to find source provider: %s', error);
			}
			if (provider) {
				req.session.regenerate(function(){
					req.session.user = {
						login: req.user.login,
						userId: req.user.userId,
						accessToken: req.user.accessToken,
						accessType: req.user.accessType
					};
					req.session.sourceProvider = provider;
					res.redirect('/dashboard');
				});
			}
			else {
				log.error('provider %s was not found', req.user.provider);
			}
		});
	};
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
    app.get('/login/github-enterprise', function(req, res) {
        res.render('login', { title: 'Naviam | Login' });
    });
    app.post('/login/github-enterprise', function (req, res, next) {
		// var domain = req.body.domain, username = req.body.username, password = req.body.password; //12iBYLzcPR2Ug
		repo.findOrCreateGithubSourceProvider({
			name: 'github', 
			domain: req.body.domain,
			protocol: 'http',
			port: 80
		}, function (error, provider) {
			if (error) {
				log.error('error getting provider: %s', error);
			}
			else {
				req.session.regenerate(function() {
					req.session.user = {
						//login: usr.login,
						//userId: usr.id,
						accessType: 'basic',
						username: req.body.username,
						password: req.body.password
					};
					req.session.sourceProvider = provider;

					var github = gh.get(req.session);
					github.user.get({}, function(err, usr) {
						if (err) {
							log.error(util.inspect(err));
						}
						log.info(util.inspect(usr));
						req.session.user.login = usr.login;
						req.session.user.userId = usr.id;

						var params = { provider: provider, accessType: 'basic', profile: { id: usr.id, username: usr.login } };
						repo.findOrCreateGithubUser(params, function(err, user) {
							// return done(err, user);
							if (err) { 
								res.redirect('/login/github-enterprise'); 
							}
							if (user) {
								res.redirect('/dashboard');
							}
						});
					});
				});
			}
		});
	});

	app.get('/', function(req, res) {
        res.render('index', { title: 'Naviam' });
    });

	// app.get('/account/add', function(req, res) {
	//	var github = gh.get(req.session);
	//	github.user.getOrgs({}, function(err, orgs) {
	//		if (err) log.error(util.inspect(err));
	//		log.info(util.inspect(orgs));
	//		res.render('createaccount', 
	//			{
	//				title: 'Naviam | Create Account',
	//				orgs: orgs
	//			});
	//	});
	// });

	// app.post('/account', function(req, res) {
	//	log.info(req.body);
	// });

	app.get('/dashboard', function(req, res) {
		var github = gh.get(req.session);
		github.user.get({}, function(err, usr) {
            if (err) {
				log.error(util.inspect(err));
            }
            log.info(util.inspect(usr));
            github.user.getOrgs({}, function(err, orgs) {
                if (err) log.error(util.inspect(err));
                log.info(util.inspect(orgs));
                res.render('dashboard', {
                    title: 'Naviam | Dashboard',
                    user: usr, 
                    orgs: orgs
                });
            });
		});
	});

	app.get('/repositories/:org', function(req, res) {
		var github = gh.get(req.session);
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
		var github = gh.get(req.session);
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
		var github = gh.get(req.session);
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
		var github = gh.get(req.session);
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
	//	var orgName = req.params.org;
	//	log.info("get repos for org: " + orgName);
	//	github.repos.getFromOrg({org: orgName}, function (err, repos) {
	//		if (err) {
 //                log.error("get from org error: " + err);
 //            }
	//		res.json(repos);
	//	});
	// });

	// app.get('/stories/:owner/:repo', function (req, res) {
	//	var repoName = req.params.repo;
	//	var owner = req.params.owner;
	//	log.info("get stories for repo: " + repoName + " and owner: " + owner);
	//	github.pullRequests.getAll({ user: owner, repo: repoName }, function (err, stories) {
	//		if (err) {
 //                log.error("get pull requests error: " + err);
 //            }
 //            log.info("get stories from repo error: " + err);
	//		res.json(stories);
	//	});
	// });

	function ensureAuthenticated(req, res, next) {
		if (req.session.user) { return next(); }
		res.redirect('/');
	}

	return this;
};