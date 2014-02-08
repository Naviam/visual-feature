exports.index = function(req, res) {
    var accountId = req.params.account;
    console.log(accountId);

    github.user.get({}, function(err, usr) {
        github.user.getOrgs({}, function(err, orgs) {
            console.log(err);
            console.log(orgs);
            res.render('dashboard', { title: 'Naviam | Dashboard', user: usr, orgs: orgs });
        });
    });
};