module.exports = function (app, github, passport, database) {
    var mongoose = require('mongoose');
    var schema = require('../model/schema');

    var User = mongoose.model('User');
    var Account = mongoose.model('Account');

    app.get('/accounts/:account', ensureAuthenticated, function(req, res) {
        var accountId = req.params.account;
        console.log(accountId);
        github.user.get({}, function(err, usr) {
            console.log(err);
            console.log(usr);
            github.user.getOrgs({}, function(err, orgs) {
                console.log(err);
                console.log(orgs);
                res.render('dashboard_new', { title: 'Naviam | Dashboard', user: usr, orgs: orgs });
            });
        });
    });
    app.get('/accounts', ensureAuthenticated, function(req, res) {

    });
    app.get('/accounts/create', ensureAuthenticated, function(req, res) {
        // register new account
        User.findById(req.session.user.id, function(err, user) {
            if (user) {
                if (user.accounts) {
                    res.redirect('/accounts/' + user.accounts[0].id);
                }

                user.accounts = [];
                console.log('call getOrgs in accounts/create');

                github.user.getOrgs({}, function(err, orgs) {
                    console.log(err);
                    console.log(orgs);
                    // orgs.forEach(function(org) {
                    //     user.accounts.push(org);
                    // });
                });
            }
        });
    });

    function ensureAuthenticated(req, res, next) {
        if (req.session.user) { return next(); }
        res.redirect('/');
    }
};