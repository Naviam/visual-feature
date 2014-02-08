module.exports = function (app, github, passport, db) {
	var auth = require('./auth')(app, github, passport, db);
	var views = require('./views');
	var accounts = require('./accounts');

	app.get('/', views.index);
	app.get('/login', views.login);
	app.get('/:account', ensureAuthenticated, function(req, res) {
		var accountId = req.params.account;
		console.log(accountId);
		github.user.get({}, function(err, usr) {
			console.log(usr);
			github.user.getOrgs({}, function(err, orgs) {
				console.log(err);
				console.log(orgs);
				res.render('dashboard', { title: 'Naviam | Dashboard', user: usr, orgs: orgs });
			});
		});
	});

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

	// app.namespace('/accounts', function() {
	//	app.get('/', accounts.index);
	// });

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