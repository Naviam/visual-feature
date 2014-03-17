/*
The flow of project creation is following:

User perspective

1. Choose Github or Enterprise
2. Provide username and password for Github or domain, 
username and password for Enterprise
3. Choose organization from the list
4. Choose repository from the list
5. Wait some time while project is created in our system.
6. While project is created in background ask user to enter project environments.
7. Save environments 

System perspective

1. Authenticate with chosen Github or Enterprise systems.
2. Create account and user in our system and link them to Github account.
-done
3. Get the list of organizations and show them for user
4. Get the list of repositories in a chosen organization and show them to user
5. Get chosen repo details, identify default branch and create project in our system
Remember date and time of the last sync and save to project table in mongo
6. Subscribe for Github push, pull request notifications 
7. Download all commits of a default branch and save them to redis SET
Name of the SET should be equal to project ID + '-env-' + 'production'
8. Download all pull requests and tags from repo and 
save them to mondgodb project table
9. For each pull request get commits and save commits to 
Redis SETs with name that should be equal to project ID + '-story-' + pull number
10. For each project environment branch get commits difference with production 
and save to Redis SETs project ID + '-env-' + environment name
11. Find if pull request commits present in any of environments 
*/

// configuration
var config = require('./lib/config');

// database
var client = require('./model/redis');
var db = require('./model/mongodb');
var mongoose = require('mongoose');
var schema = require('./model/schema');

// logger
var log = require('./lib/logger');
log.debug('testing logger debug');
log.info('testing logger info');
log.warning('testing logger warning');
log.error('testing logger error');
log.critical('testing logger critical');
log.emergency('testing logger emergency');


var GitHubApi = require('github');
var host = 'github.servicechannel.com';
var user = 'ServiceChannel';
var repo = 'ServiceClick';
var repoSet = 'github-'+host+'-'+user+'-'+repo+'-default';

var github = new GitHubApi(
{
    version: '3.0.0',
    timeout: 5000,
    protocol: 'http',
    url: '/api/v3',
    port: 80,
    host: host,
    debug: false
});
github.authenticate({
    type: 'basic',
    username: 'vhatalski',
    password: '12iBYLzcPR2Ug'
});

this.getBranches = function(repoName, callback) {
    var handleGetBranches = function(error, result) {
        if (error) {
            log.error(error);
            callback(error);
        }
        if (result) {
            log.debug('Number of branches: ' + result.length);
            callback(null, result);
        }
        else {
            log.info('No braches were found');
            callback('No braches were found');
        }
    };
    github.repos.getBranches({ user: user, repo: repoName }, handleGetBranches);
};

this.getRepository = function(callback) {
    var handleGetRepository = function(error, result) {
        console.time('handleGetRepository');
        if (error) {
            log.error(error);
        }
        var repository = {
            master: result.default_branch,
            name: result.name,
            description: result.description
        };
        log.debug(JSON.stringify(repository));
        this.getBranches(repository.name, function(error, result) {
            github.repos.getBranches({});
        });
        console.endTime('handleGetRepository');
    };

    github.repos.get({ user: user, repo: repo }, handleGetRepository);
};

this.getRepositoryCommits = function(branch, callback) {
    log.debug(repoSet);
    var getCommits = function(error, result) {
        console.time('getCommits');
        if (error) {
            log.error(error);
        }
        log.info('Number of results: ' + result.length);
        result.forEach(function(value) {
            client.sadd(repoSet, value.sha);
        });
        if (github.hasNextPage(result)) {
            client.scard(repoSet, function(error, count) {
                if (error) {
                    log.error(error);
                }
                log.debug('count: ' + count);
                if (count < 40000) {
                    log.debug(Date.now());
                    github.getNextPage(result, getCommits);
                }
                else {
                    client.quit(function (err, res) {
                        log.info("Exiting from quit command.");
                    });
                }
            }); 
        }
        else {
            client.scard(repoSet, function(error, count) {
                callback(error, count);
            });
        }
        console.timeEnd('getCommits');
    };
    github.repos.getCommits(
        { 
            user: user, 
            repo: repo, 
            sha: branch,
            since: '2014-02-01T00:00:00Z',
            per_page: 100 
        }, getCommits);
};

this.getRepositoryCommits('master', function(error, count) { 
    log.info(count);
});