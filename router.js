module.exports = function () {
	var app = require('./app');
	var home = require('./controllers/home');
	var login = require('./controllers/login')(app);
	// var api = require('./controllers/api');

	app.get('/', home.index);
	app.get('/dashboard', home.login);
};