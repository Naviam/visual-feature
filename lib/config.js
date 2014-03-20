var nconf = require('nconf');
var path = require('path');

nconf.argv()
     .env()
     .file({ file: path.join(__dirname, '../config/app.json') });

nconf.defaults({
	'IP': '127.0.0.1',
	'PORT': 3000,
	'GITHUB_CLIENT_ID': 'd24dfef0f98062c793f6',
	'GITHUB_CLIENT_SECRET': 'e5fe11d7e985757ebf8af9d48392b8f8077d1fb9',
	'GITHUB_CALLBACK_URL': 'http://localhost:3000/auth/github/callback'
});

module.exports = nconf;