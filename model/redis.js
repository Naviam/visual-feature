var redis = require('redis');
var client = redis.createClient(14811, 'pub-redis-14811.us-east-1-2.1.ec2.garantiadata.com');
client.auth('redisdb', function() {
    console.log('Redis successfully connected!');
});

client.on("error", function (err) {
    console.log("error event - " + client.host + ":" + client.port + " - " + err);
});
process.on('SIGINT', function() {
	console.log('About to close connection to redis server..');
	client.quit(function (err, res) {
		console.log("Exiting from quit command.");
	});
	process.exit(0);
});

module.exports = client;