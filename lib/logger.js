var logentries = require('node-logentries');
var config = require('./config');

var log = logentries.logger({
	token: config.get('logentries:token'), //'49b3c292-089e-4d6e-a58c-9bfaddb3ac86',
	levels: config.get('logentries:custom:levels') // myCustomLevels.levels
});

// use as a winston transport
var winston = require('winston');
winston.setLevels(config.get('logentries:custom:levels'));
winston.addColors(config.get('logentries:custom:colors'));
winston
  .remove(winston.transports.Console)
  .add(winston.transports.Console, { colorize: true, timestamp: true });
log.winston(winston, { level: 'debug' });

// display logentries errors in console.
log.on('error', function(err) {
	console.log('logentries error: ' + err);
});

module.exports = winston;