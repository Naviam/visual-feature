var nconf = require('nconf');
var path = require('path');

//console.log(path.join(__dirname, '../config/app.json'));
nconf.argv()
     .env()
     .file({ file: path.join(__dirname, '../config/app.json') });

module.exports = nconf;