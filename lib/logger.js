var logentries = require('node-logentries');

var myCustomLevels = {
    levels: { debug:0, info:1, warning:2, error:3, critical:4, emergency:5 },
    colors: {
      debug: 'blue',
      info: 'green',
      warning: 'yellow',
      error: 'red',
      critical: 'red',
      emergency: 'red'
    }
};

var log = logentries.logger({
	token: '49b3c292-089e-4d6e-a58c-9bfaddb3ac86',
	levels: myCustomLevels.levels
});

// use as a winston transport
var winston = require('winston');
winston.setLevels(myCustomLevels.levels);
winston.addColors(myCustomLevels.colors);
winston
  .remove(winston.transports.Console)
  .add(winston.transports.Console, { colorize: true, timestamp: true });
log.winston(winston, { level: 'debug' });

// display logentries errors in console.
log.on('error', function(err) {
	console.log('logentries error: ' + err);
});

module.exports = winston;