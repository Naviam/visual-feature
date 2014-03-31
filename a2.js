var registerRepo = require('./a.js');

var params = {
	githubId: 284556,
	login: 'hatalski',
	email: 'v.hatalski@gmail.com',
	domain: 'github.servicechannel.com',
	accessToken: '',
	organization: { id: 331906, name: 'servicechannel' }
};
registerRepo.loginUser(params, function (error, user) {
	if (error) {
		//log.error(error);
	}
	console.log(user.account);
});