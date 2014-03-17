var assert = require("assert");
describe('configuration', function(){
  describe('load configuration from file', function(){
	var config = require('../lib/config');
    it('should return logentries token', function(){
      assert.equal(config.get('logentries:token'), "49b3c292-089e-4d6e-a58c-9bfaddb3ac86");
    });
  });
});