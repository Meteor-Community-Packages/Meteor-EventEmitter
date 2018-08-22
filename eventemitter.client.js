/* global EventEmitter: true */
EventEmitter = function(options) {
  var self = this;
  // Check that the user uses "new" keyword for api consistency
  if (! (self instanceof EventEmitter)) {
    throw new Error('use "new" to construct an EventEmitter');
  }

  options = options || {};

  // Hidden scope
  self._eventEmitter = {
    onListeners: {},
    onceListeners: {},
    maxListeners: options.maxListeners || 10
  };
};

var _checkListenerLimit = function(eventName, listenerCount) {
  var self = this;
  // Check if we are to send a warning
  if (self._eventEmitter.maxListeners && listenerCount > self._eventEmitter.maxListeners) {
    // Return string
    return 'warning: possible EventEmitter memory leak detected. ' +
        listenerCount + ' listeners added on event "' + eventName +
        '". Use emitter.setMaxListeners() to increase limit. (' +
        self._eventEmitter.maxListeners + ')';

  }
};

// By default EventEmitters will print a warning if more than 10 listeners are
// added for a particular event. This is a useful default which helps finding
// memory leaks. Obviously not all Emitters should be limited to 10. This function
// allows that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  this._eventEmitter.maxListeners = n;
};

var _addToList = function(list, eventName, listener) {
  // Check that we have a container for the event, Create listener array
  if (typeof list[eventName] === 'undefined') {
    list[eventName] = [];
  }

  // Make sure the listener is not in there already?
  // We have to comment this to be compliant with node.js
  // list[eventName] = _.without(list[eventName], listener);

  // Add the listener and Check the limit
  return _checkListenerLimit.apply(this, [eventName, list[eventName].push(listener)]);
};

// Adds a listener to the end of the listeners array for the specified event.
// server.on('connection', function (stream) {
//   console.log('someone connected!');
// });
// Returns emitter, so calls can be chained.
EventEmitter.prototype.on = function(eventName, listener) {
  var warn = _addToList.apply(this, [this._eventEmitter.onListeners, eventName, listener]);

  // Warn if needed
  if (warn) {
    console.warn((new Error(warn)).stack);
  }

  // Return the emitter
  return this;
};

// Adds a one time listener for the event. This listener is invoked
// only the next time the event is fired, after which it is removed.
EventEmitter.prototype.once = function(eventName, listener) {
  var warn = _addToList.apply(this, [this._eventEmitter.onceListeners, eventName, listener]);

  // Warn if needed
  if (warn) {
    console.warn((new Error(warn)).stack);
  }

  // Return the emitter
  return this;
};

var _runCallbacks = function(listenerArray, args) {
  var self = this;
  // count of listeners triggered
  var count = 0;
  // Check if we have anything to work with
  if (typeof listenerArray !== 'undefined') {
    // Try to iterate over the listeners
    listenerArray.forEach(function(listener) {
      // Count listener calls
      count++;
      // Send the job to the eventloop
      listener.apply(self, args);
    });
  }

  // Return the count
  return count;
};

// emitter.emit(event, [arg1], [arg2], [...])#
// Execute each of the listeners in order with the supplied arguments.
EventEmitter.prototype.emit = function(eventName /* arguments */) {
  var self = this;
  // make argument list to pass on to listeners
  var args = Array.prototype.slice.call(arguments, 1);

  // Count listeners triggered
  var count = 0;

  // Swap once list
  var onceList = self._eventEmitter.onceListeners[eventName];

  // Empty the once list
  self._eventEmitter.onceListeners[eventName] = [];

  // Trigger on listeners
  count += _runCallbacks.call(self, self._eventEmitter.onListeners[eventName], args);

  // Trigger once listeners
  count += _runCallbacks.call(self, onceList, args);

  // Returns true if event had listeners, false otherwise.
  return (count > 0);
};

// XXX: When removing a listener in node js it only removes one - not all.
var _withoutOne = function(list, obj) {
  var found = false;
  var result = [];

  // Iterate over listeners
  for (var i = 0; i < list.length; i++) {
    // Check if we found one...
    if (!found && list[i] === obj) {
      found = true;
    } else {
      result.push(list[i]);
    }
  }

  // return the new array
  return result;
};

// Removes all listeners, or those of the specified event. It's not a
// good idea to remove listeners that were added elsewhere in the code,
// especially when it's on an emitter that you didn't create (e.g. sockets
// or file streams).
// Returns emitter, so calls can be chained.
EventEmitter.prototype.off = function(eventName, listener) {
  var self = this;
  if (eventName) {
    if (typeof listener === 'function') {
      // its a bit more tricky - we have to iterate over the arrays and only
      // clone listeners not equal to
      if (typeof self._eventEmitter.onListeners[eventName] !== 'undefined') {
        self._eventEmitter.onListeners[eventName] = _withoutOne(self._eventEmitter.onListeners[eventName], listener);

      }
      if (typeof self._eventEmitter.onceListeners[eventName] !== 'undefined') {
        self._eventEmitter.onceListeners[eventName] = _withoutOne(self._eventEmitter.onceListeners[eventName], listener);

      }
    } else {
      // Remove all listeners for eventName
      self._eventEmitter.onListeners[eventName] = [];
      self._eventEmitter.onceListeners[eventName] = [];
    }

  } else {
    // Remove all listeners
    self._eventEmitter.onListeners = {};
    self._eventEmitter.onceListeners = {};
  }
};

// Add api helpers
EventEmitter.prototype.addListener = EventEmitter.prototype.on;
EventEmitter.prototype.removeListener = EventEmitter.prototype.off;
EventEmitter.prototype.removeAllListeners = EventEmitter.prototype.off;

// Add jquery like helpers
EventEmitter.prototype.one = EventEmitter.prototype.once;
EventEmitter.prototype.trigger = EventEmitter.prototype.emit;
