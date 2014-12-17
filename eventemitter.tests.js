function equals(a, b) {
  return !!(EJSON.stringify(a) === EJSON.stringify(b));
}

var noop = function() {};

Tinytest.add('emitter - test environment', function(test) {
  test.isTrue(typeof EventEmitter !== 'undefined', 'test environment not initialized EventEmitter');
});


Tinytest.add('emitter - test more than 10 listeners warning', function(test) {
  // This is actually just a test to see if we get a warning about +10 listeners
  var emitter = new EventEmitter();
  for (var i = 0; i < 11; i++)
    emitter.on('test', noop);
});

Tinytest.addAsync('emitter - test basic event', function(test, completed) {
  var emitter = new EventEmitter();

  emitter.on('test', function(foo, bar) {
    test.equal(foo, 'foo', 'foo is not foo');
    test.equal(bar, 'bar', 'bar is not bar');

    completed();
  });

  emitter.emit('test', 'foo', 'bar');
});

Tinytest.addAsync('emitter - test event namespace', function(test, completed) {
  var emitterA = new EventEmitter();
  var emitterB = new EventEmitter();

  emitterA.on('test', function() {
    test.fail('We never emitted a "test" event to emitterA');
    completed();
  });

  emitterB.emit('test', 'We have no listeners on B yet');

  emitterB.on('test', function() {
    test.ok('We never emitted a "test" event to emitterA');
    completed();
  });

  emitterB.emit('test', 'Hello B');

});

Tinytest.addAsync('emitter - test on and once', function(test, completed) {
  var emitterA = new EventEmitter();

  var counter = 0;
  var expectedCount = 3;

  emitterA.on('test', function() {
    counter++;
  });

  emitterA.once('test', function() {
    counter++;
  });

  emitterA.emit('test', 'Hello'); // 2

  emitterA.emit('test', 'World'); // 1

  // wait for result
  Meteor.setTimeout(function() {
    if (counter < expectedCount) {
      test.fail('We are missing some callbacks ' + counter + ' expected ' + expectedCount);
    }
    if (counter > expectedCount) {
      test.fail('We are getting too many callbacks ' + counter + ' expected ' + expectedCount);
    }
    completed();      
  }, 10);
});

Tinytest.addAsync('emitter - test remove listener', function(test, completed) {
  var emitterA = new EventEmitter();

  var counter = 0;
  var expectedCount = 3;

  emitterA.on('test2', function() {
    counter++;
  });

  emitterA.on('test', function() {
    counter++;
  });

  emitterA.once('test', function() {
    counter++;
  });

  emitterA.emit('test', 'Hello'); // 2

  emitterA.removeAllListeners('test');

  // This should still emit...
  emitterA.emit('test2', 'Hello'); // 1

  // wait for result
  Meteor.setTimeout(function() {
    if (counter < expectedCount) {
      test.fail('We are missing some callbacks ' + counter + ' expected ' + expectedCount);
    }
    if (counter > expectedCount) {
      test.fail('We are getting too many callbacks ' + counter + ' expected ' + expectedCount);
    }
    completed();      
  }, 10);
});

Tinytest.addAsync('emitter - test remove all listeners', function(test, completed) {
  var emitterA = new EventEmitter();

  var counter = 0;
  var expectedCount = 2;

  emitterA.on('test2', function() {
    counter++;
  });

  emitterA.on('test', function() {
    counter++;
  });

  emitterA.once('test', function() {
    counter++;
  });

  emitterA.emit('test', 'Hello'); // 2

  emitterA.removeAllListeners();

  // This should not emit...
  emitterA.emit('test2', 'Hello'); // 0

  // wait for result
  Meteor.setTimeout(function() {
    if (counter < expectedCount) {
      test.fail('We are missing some callbacks ' + counter + ' expected ' + expectedCount);
    }
    if (counter > expectedCount) {
      test.fail('We are getting too many callbacks ' + counter + ' expected ' + expectedCount);
    }
    completed();      
  }, 10);
});

Tinytest.addAsync('emitter - test one listener', function(test, completed) {
  var emitterA = new EventEmitter();

  var counter = 0;
  var expectedCount = 7;

  var knownListener = function() {
    counter++;
  }

  emitterA.on('test', knownListener);

  emitterA.once('test', knownListener);

  emitterA.on('test', function() {
    counter++;
  });

  emitterA.once('test', function() {
    counter++;
  });

  emitterA.emit('test', 'Hello'); // 4

  emitterA.emit('test', 'Hello'); // 2

  emitterA.removeListener('test', knownListener);

  emitterA.emit('test', 'Hello'); // 1

  // wait for result
  Meteor.setTimeout(function() {
    if (counter < expectedCount) {
      test.fail('We are missing some callbacks ' + counter + ' expected ' + expectedCount);
    }
    if (counter > expectedCount) {
      test.fail('We are getting too many callbacks ' + counter + ' expected ' + expectedCount);
    }
    completed();      
  }, 10);
});


Tinytest.addAsync('emitter - test only add known listener once', function(test, completed) {
  var emitterA = new EventEmitter();

  var counter = 0;
  var expectedCount = 19;

  var knownListener = function() {
    counter++;
  }

  emitterA.on('test', knownListener); // 1
  emitterA.on('test', knownListener); // 2
  emitterA.on('test', knownListener); // 3
  emitterA.on('test', knownListener); // 4
  emitterA.on('test', knownListener); // 5

  emitterA.once('test', knownListener);
  emitterA.once('test', knownListener);
  emitterA.once('test', knownListener);
  emitterA.once('test', knownListener);
  emitterA.once('test', knownListener);


  emitterA.emit('test', 'Hello'); // 2 (10)

  emitterA.emit('test', 'Hello'); // 1 (5)

  emitterA.removeListener('test', knownListener);

  emitterA.emit('test', 'Hello'); // 0 (4)

  // wait for result
  Meteor.setTimeout(function() {
    if (counter < expectedCount) {
      test.fail('We are missing some callbacks ' + counter + ' expected ' + expectedCount);
    }
    if (counter > expectedCount) {
      test.fail('We are getting too many callbacks ' + counter + ' expected ' + expectedCount);
    }
    completed();      
  }, 10);
});

Tinytest.addAsync('emitter - test when got a failing listener', function(test, completed) {
  var emitterA = new EventEmitter();

  var counter = 0;
  var expectedCount = 2;

  var knownListener = function() {
    counter++;
  }

  var failListener = function() {
    throw new Error('Failing listener');
    counter++;
  }

  emitterA.on('test', knownListener); // 1
  emitterA.on('test', knownListener); // 2
  emitterA.on('test', failListener); // 3
  emitterA.on('test', knownListener); // 4
  emitterA.on('test', knownListener); // 5

  emitterA.once('test', knownListener);
  emitterA.once('test', knownListener);
  emitterA.once('test', failListener);
  emitterA.once('test', knownListener);
  emitterA.once('test', knownListener);


  try {
    emitterA.emit('test', 'Hello');
    test.fail("tests needs to be failed!");
  } catch(ex) {
    test.equal(counter, expectedCount);
    completed();
  } 
});
//Test API:
//test.isFalse(v, msg)
//test.isTrue(v, msg)
//test.equal(actual, expected, message, not)
//test.length(obj, len)
//test.include(s, v)
//test.isNaN(v, msg)
//test.isUndefined(v, msg)
//test.isNotNull
//test.isNull
//test.throws(func)
//test.instanceOf(obj, klass)
//test.notEqual(actual, expected, message)
//test.runId()
//test.exception(exception)
//test.expect_fail()
//test.ok(doc)
//test.fail(doc)