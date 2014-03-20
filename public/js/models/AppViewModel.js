function link (url, text, title) {
    this.url = url;
    this.text = text;
    this.title = title;
}

function findLinksInString(str) {
    geturl = new RegExp(
          "(^|[ \t\r\n])((ftp|http|https|gopher|mailto|news|nntp|telnet|wais|file|prospero|aim|webcal):(([A-Za-z0-9$_.+!*(),;/?:@&~=-])|%[A-Fa-f0-9]{2}){2,}(#([a-zA-Z0-9][a-zA-Z0-9$_.+!*(),;/?:@&~=%-]*))?([A-Za-z0-9$_+!*();/?:~-]))"
         ,"g"
       );
    return str.match(geturl) || "";
}

function organization(org, parent) {
    var self = this;
    self.parent = parent;
    self.login = org.login;
    self.isCollapsed = ko.observable(false);

    self.repositories = ko.observableArray();

    self.toggleCollapse = function () {
        self.isCollapsed(!self.isCollapsed());
    };

    self.getRepositories = function (org) {
        $.getJSON("/repositories/" + org, function(data) {
            self.repositories(data);
            var found = jQuery.grep(self.repositories(), function(r) {
                // TODO: replace hardcoded name with user session variable
                return r.name == "Fixxbook";
            });
            if (found.length == 1) {
                window.viewmodel.setCurrentRepository(found[0]);
            }
        });
    };
    self.getRepositories(self.login);
}

function story(story, parent) {
    var self = this;
    self.title = ko.observable(story.title);
    self.number = ko.observable(story.number);
    self.body = ko.observable(story.body);
    self.ref = ko.observable(story.head.ref);
    self.sha = ko.observable(story.head.sha);
    self.normalizedBody = ko.observable();
    self.html_url = ko.observable(story.html_url);
    self.environment = ko.observable();

    self.text = ko.computed(function() {
        var text = self.title() + " " + self.body();
        return text.replace("... ...", "");
    });

    self.links = ko.computed(function () {
        var links = findLinksInString(self.text());
        // TODO: remove links from description
        self.normalizedBody(self.text());
        for (var i in links) {
            self.normalizedBody(self.normalizedBody().replace(links[i], ""));
        }
        return links;
    });

    self.storyLinks = ko.computed(function () {
        var array = [];
        console.log(self.links());
        for (var index in self.links())
        {
            var lnk = self.links()[index];
            console.log(lnk);
            var text = lnk.substring(lnk.lastIndexOf('/') + 1);
            array.unshift(new link(lnk, text, text));
        }
        return array;
    });

    self.identifyEnvironments = function() {
        $.getJSON("/compare/" + parent.owner() + "/" + parent.name() + "/staging/" + self.ref(), 
        function(compare) {
            if (compare.ahead_by === 0) {
                self.environment("ST1");
            }
        });
    };
    self.identifyEnvironments();
}

function environment (parent, fullname, shortname, branchname, css) {
	var self = this;
	self.fullname = ko.observable(fullname);
	self.shortname = ko.observable(shortname);
	self.branchname = ko.observable(branchname);
	self.css = ko.observable(css);

	self.stories = ko.observableArray();
	self.commits = ko.observableArray();
	self.count = ko.computed(function() {
		return self.stories().length;
	});

	self.populateCommits = function(ownerName, repoName, branchName) {
        $.getJSON("/user/" + ownerName + "/repo/" + repoName + "/branch/" + branchName, 
        function(data) {
            self.commits.removeAll();
            $.each(data, function (index, value) {
                self.commits.unshift(value.sha);
            });
        });
	};
    self.populateCommits(parent.owner(), parent.name(), self.branchname());
}

function repository(repo, parent) {
    var self = this;
    self.name = ko.observable(repo.name);
    self.owner = ko.observable(repo.owner.login);
    self.environments = ko.observableArray();
    self.environments.push(new environment(self, "Development", "DEV", "dev", "label-default"));
    self.environments.push(new environment(self, "QA1", "QA1", "qa1", "label-warning"));
    self.environments.push(new environment(self, "QA2", "QA2", "qa2", "label-warning"));
    self.environments.push(new environment(self, "Staging", "ST1", "staging", "label-warning"));
    self.environments.push(new environment(self, "Load Tests", "LD1", "ld1", "label-warning"));
    self.environments.push(new environment(self, "Sandbox1", "SB1", "master", "label-info"));
    self.environments.push(new environment(self, "Sandbox2", "SB2", "master", "label-info"));
    self.environments.push(new environment(self, "Production", "PRD", "master", "label-success"));
    self.stories = ko.observableArray();

    self.getCompletedStories = function (ownerName, repoName) {
        var self = this;
        self.currentStory = null;
        $.getJSON("/stories/" + ownerName + "/" + repoName, function(data) {
            self.stories.removeAll();
            $.each(data, function (index, value) {
                self.stories.unshift(new story(value, self));
            });
            //self.stories(data);
        });
    };
    self.getCompletedStories(self.owner(), self.name());
}

function AppViewModel(model) {
    var self = this;

    self.user = ko.observable(model.user);
    window.enterprise = model.user.site_admin;
    self.currentRepository = ko.observable();
    self.organizations = ko.observableArray();
    for (var org in model.orgs) {
        self.organizations.unshift(new organization(model.orgs[org], self));
    }

    self.setCurrentRepository = function (repo) {
        console.log(repo);
        self.currentRepository(new repository(repo));
    };
}