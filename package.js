Package.describe({
  name: "raix:eventemitter",
  version: '0.1.2',
  summary: "A server and client event package.",
  git: "https://github.com/raix/Meteor-EventEmitter.git"
});

Package.onUse(function (api) {

  api.versionsFrom('1.0');

  api.use(['underscore']);

  api.addFiles('eventemitter.client.js', 'client');

  api.addFiles('eventemitter.server.js', 'server');

  api.export('EventEmitter')
});


Package.onTest(function (api) {
  api.use(['raix:eventemitter']);
  api.use('test-helpers', ['server', 'client']);
  api.use('tinytest');

  api.addFiles('eventemitter.tests.js');
});
