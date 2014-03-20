var assert = require("assert");
var config = require('../');


describe('find or create account and user', function() {

	describe('default index page', function() {
		var github = require('../lib/github')({'authType': 'github'}, config);

		it('should open landing page', function() {
			github.user.get({}, function(error, response) {
				assert.equal(response.id, "49b3c292-089e-4d6e-a58c-9bfaddb3ac86");
			});
		});
	});

});