var http = require('http');
var express = require('express');
var resources = require('express-resource');
var namespace = require('express-namespace');
var path = require('path');
var passport = require('passport');
var RedisStore = require('connect-redis')(express);
var client = require('./lib/redis');
var log = require('./lib/logger');
var config = require('./lib/config');

var app = module.exports = express();
app.set('host', process.env.IP || "127.0.0.1");
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger({
	format: 'dev', 
	stream: {
		write: function(message,encoding) {
			log.info(message.replace('\n', ''));
		}
    }
}));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
	store: new RedisStore({ client: client }), 
	secret: config.get('app:session:secret') }));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
if (!module.parent) {
	var routes = require('./routes/routes')(app, passport);
}
app.use(express.static(path.join(__dirname, 'public')));

if (!module.parent) {
	http.createServer(app).listen(app.get('port'), app.get('host'), function() {
		log.info('Express server listening', { port: app.get('port'), host: app.get('host')});
	});
}