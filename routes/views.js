exports.index = function(req, res){
    res.render('index', { title: 'Naviam' });
};

exports.login = function(req, res){
	res.render('login', { title: 'Naviam | Login' });
};