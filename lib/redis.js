var redis = require('redis');
var log = require('./logger');
var config = require('./config');

var client = redis.createClient(
	config.get('redis:port'), 
	config.get('redis:host'));
client.auth(config.get('redis:password'), function() {
    log.info('Redis successfully connected!', { host: client.host, port: client.port });
});

client.on("error", function (err) {
    log.error("Redis error occurred", { host: client.host, port: client.port, error: err });
});
process.on('SIGINT', function() {
	client.quit(function (err, res) {
		log.info("Exiting from quit command.", { response: res });
	});
	process.exit(0);
});

module.exports = client;