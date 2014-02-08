module.exports = function (app, github, passport, db) {
	var auth = require('./auth')(app, github, passport, db);
	var views = require('./views');
	var accounts = require('./accounts');

	app.get('/', views.index);
	app.get('/login', views.login);

	app.get('/:account', ensureAuthenticated, accounts.index);

	// app.namespace('/accounts', function() {
	//	app.get('/', accounts.index);
	// });

	//app.resource('/auth', auth);

	//app.get('/', routes.index);
	//app.get('/dashboard', ensureAuthenticated, routes.dashboard);
	//app.get('/repositories/:org', routes.repositories);
	//app.get('/stories/:owner/:repo', routes.stories);
	//app.get('/clean', routes.clean);
	//app.post('/sns', sns.sns);

	// Simple route middleware to ensure user is authenticated.
	//   Use this route middleware on any resource that needs to be protected.  If
	//   the request is authenticated (typically via a persistent login session),
	//   the request will proceed.  Otherwise, the user will be redirected to the
	//   login page.
	function ensureAuthenticated(req, res, next) {
		debugger;
		console.log("is authenticated: " + req.session);
		if (req.user) { return next(); }
		res.redirect('/');
	}
};