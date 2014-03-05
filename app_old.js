var req = require("http").request(
	{
		hostname: 'github.servicechannel.com',
		port: 80,
		path: '/api/v3/user',
		method: 'get',
		headers: 
		{
     		host: 'github.servicechannel.com',
    		'content-length': '0',
    		authorization: 'Basic dmhhdGFsc2tpOjEyaUJZTHpjUFIyVWc=',
    		'user-agent': 'NodeJS HTTP Client'
     	}
    }
    ,	function(res) {
            console.log("STATUS: " + res.statusCode);
            console.log("HEADERS: " + JSON.stringify(res.headers));
            res.setEncoding("utf8");
            var data = "";
            res.on("data", function(chunk) {
                data += chunk;
                console.log('BODY: ' + chunk);
            });
            res.on("error", function(err) {
                console.log('problem with response: ' + err.message);
            });
            res.on("end", function() {
            	console.log("STATUS: " + res.statusCode);
            });
        });
req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});
//req.write('data\n');
//req.write('data\n');
req.end();