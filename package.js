Package.describe({
  name: "raix:eventemitter",
  version: '2.0.0-rc.0',
  summary: "A server and client event package.",
  git: "https://github.com/raix/Meteor-EventEmitter.git",
  deprecated: true
});

Package.onUse(function (api) {
  api.versionsFrom(['1.0', '2.8.0', '3.0-rc.4']);
  api.addFiles('eventemitter.client.js', 'client');
  api.addFiles('eventemitter.server.js', 'server');
  api.export('EventEmitter');
});


Package.onTest(function (api) {
  api.versionsFrom(['1.0', '2.8.0', '3.0-rc.4']);
  api.use(['raix:eventemitter']);
  api.use('test-helpers', ['server', 'client']);
  api.use('tinytest');

  api.addFiles('eventemitter.tests.js');
});
