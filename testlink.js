var link = '<http://github.servicechannel.com/api/v3/repositories/13/commits?top=master&last_sha=0a84d6cb7d8876367e63000740d938d1cf2c3b13>; rel=\"next\", <http://github.servicechannel.com/api/v3/repositories/13/commits?sha=master>; rel="first"';

var links = {};
if (typeof link != "string")
	console.log(links);

// link format:
// '<https://api.github.com/users/aseemk/followers?page=2>; rel="next", <https://api.github.com/users/aseemk/followers?page=2>; rel="last"'
link.replace(/<([^>]*)>;\s*rel="([\w]*)\"/g, function(m, uri, type) {
    links[type] = uri;
});
console.log(links);