module.exports = function () {
	var app = require('./app');
	var home = require('./controllers/home');
	var login = require('./controllers/login');
	var api = require('./controllers/api');
	var log = require('./lib/logger');
	var config = require('./lib/config');

	this.handler = function(req, res, next) {
		log.debug('loading resource', { request: req, response: res, next: next });
		res.send('OK');
	};

	this.namespaceHandler = function() {
		log.debug('namespaceHandler application', { app: app });
	};

	app.get('/', this.handler);
	app.get('/dashboard', this.handler);

	app.namespace('/login', this.namespaceHandler);
	app.post('/logout', this.handler);
	
	app.get('/github/login', this.handler);
	app.get('/github/enterprise/login', this.handler);
	app.post('/github/enterprise/login', this.handler);

	app.namespace('/api', this.namespaceHandler);
};