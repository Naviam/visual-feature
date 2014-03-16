var http = require('http');
var express = require('express');
var resources = require('express-resource');
var namespace = require('express-namespace');
var path = require('path');
var passport = require('passport');
var RedisStore = require('connect-redis')(express);
var client = require('./model/redis');
//var MongoStore = require('connect-mongo')(express);

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
var options = {
	client: client
	//host: 'pub-redis-14811.us-east-1-2.1.ec2.garantiadata.com', 
	//port: '14811',
	//pass: 'redisdb'
};
// app.use(express.session({
//	store: new MongoStore({
//		url: 'mongodb://rmuser:kXc3GX2cSvkj0@ds027519.mongolab.com:27519/naviam-session'
//	}),
//	secret: 'naviam-848h7f744fsY7' }));
app.use(express.session({ store: new RedisStore(options), secret: 'naviam-848h7f744fsY7' }));
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