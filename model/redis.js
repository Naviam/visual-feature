var redis = require('redis');
var log = require('../lib/logger');

var client = redis.createClient(14811, 'pub-redis-14811.us-east-1-2.1.ec2.garantiadata.com');
client.auth('redisdb', function() {
    log.info('Redis successfully connected!');
});

client.on("error", function (err) {
    log.error("error event - " + client.host + ":" + client.port + " - " + err);
});
process.on('SIGINT', function() {
	log.info('About to close connection to redis server..');
	client.quit(function (err, res) {
		log.info("Exiting from quit command.");
	});
	process.exit(0);
});

module.exports = client;