var assert = require("assert");

describe('home controller', function() {

	describe('default index page', function() {
		var router = require('../router');
		it('should open landing page', function(){
			assert.equal(router, "49b3c292-089e-4d6e-a58c-9bfaddb3ac86");
		});
	});

});