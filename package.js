Package.describe({
  name: "raix:eventemitter",
  version: '0.0.2',
  summary: "A server and client event package.",
  git: "https://github.com/raix/Meteor-EventEmitter.git"
});

Package.on_use(function (api) {

  if (api.versionsFrom) {

    api.versionsFrom('METEOR@0.9.1');

  }

  api.use(['underscore']);

  api.add_files('eventemitter.client.js', 'client');

  api.add_files('eventemitter.server.js', 'server');

  api.export('EventEmitter')
});


Package.on_test(function (api) {
  if (api.versionsFrom) {
    api.use(['raix:eventemitter']);
  } else {
    api.use(['eventemitter']);
  }
  api.use('test-helpers', ['server', 'client']);
  api.use('tinytest');

  api.add_files('eventemitter.tests.js');
});
