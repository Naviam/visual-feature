var http           = require('http');
var path           = require('path');
var util           = require('util');
var express        = require('express');
var resources      = require('express-resource');
var namespace      = require('express-namespace');
var client         = require('./lib/redis');
var RedisStore     = require('connect-redis')(express);
var passport       = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
var db             = require('./lib/mongodb');
var passportHelper = require('./lib/passportHelper');
var log            = require('./lib/logger');
var onStreamWrite  = function(message, encoding) { log.info(message.replace('\n', '')); };
var config         = require('./lib/config');

passport.serializeUser(passportHelper.serializeUser);
passport.deserializeUser(passportHelper.deserializeUser);

log.debug('github config', {
	clientID: config.get('GITHUB_CLIENT_ID'), 
	clientSecret: config.get('GITHUB_CLIENT_SECRET'), 
	callbackURL: config.get('GITHUB_CALLBACK_URL')});
passport.use(new GitHubStrategy({
		clientID: config.get('GITHUB_CLIENT_ID'),
		clientSecret: config.get('GITHUB_CLIENT_SECRET'),
		callbackURL: config.get('GITHUB_CALLBACK_URL'),
		scope: "user,repo"
	}, passportHelper.obtainGithubAccessToken)
);

var app = module.exports = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger({ format: 'dev', stream: { write: onStreamWrite } }));
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
	var routes = require('./controllers')(app);
	log.debug(util.inspect(routes));
	app.get('/login/github', passport.authenticate('github'));
	app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), routes.githubAuthenticate);
}
app.use(express.static(path.join(__dirname, 'public')));

if (!module.parent) {
	http.createServer(app).listen(config.get('PORT'), config.get('IP'), function() {
		log.info('Express server listening', { port: config.get('PORT'), host: config.get('IP')});
	});
}