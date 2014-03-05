var http = require('http');
var express = require('express');
var resources = require('express-resource');
var namespace = require('express-namespace');
var path = require('path');
var passport = require('passport');
//var RedisStore = require('connect-redis')(express);
var MongoStore = require('connect-mongo')(express);

var app = express();
app.set('host', process.env.IP || "127.0.0.1");
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
// var options = {
//	host: '127.0.0.1',//'nodejitsudb6553126701.redis.irstack.com', 
//	port: '6379'//,
//	//pass: 'nodejitsudb6553126701.redis.irstack.com:f327cfe980c971946e80b8e975fbebb4'
// };
app.use(express.session({
	store: new MongoStore({
		url: 'mongodb://localhost/naviam-session'
	}),
	secret: 'naviam-848h7f744fsY7' }));
// app.use(express.session({ store: new RedisStore(options), secret: 'naviam-848h7f744fsY7' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
var routes = require('./routes/routes')(app, passport);
app.use(express.static(path.join(__dirname, 'public')));

http.createServer(app).listen(app.get('port'), app.get('host'), function() {
  console.log(
	'Express server listening on port ' + app.get('port') + 
	' at host ' + app.get('host'));
});