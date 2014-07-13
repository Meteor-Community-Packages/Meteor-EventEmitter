EventEmitter = function(options) {
  var self = this;
  options = options || {};
  // Check that the user uses "new" keyword for api consistency
  if (!(this instanceof EventEmitter))
    throw new Error('EventEmitter missing "new" keyword');

  self.onListeners = {};
  self.onceListeners = {};
  self.maxListeners = options.maxListeners || 10;
};

EventEmitter.prototype._checkListenerLimit = function(eventName, listenerCount) {
  var self = this;
  // Check if we are to send a warning
  if (self.maxListeners && listenerCount > self.maxListeners) {
    // Return string
    return 'warning: possible EventEmitter memory leak detected. ' +
        listenerCount + ' listeners added on event "' + eventName +
        '". Use emitter.setMaxListeners() to increase limit. (' +
        self.maxListeners + ')';
      
  }  
};

// By default EventEmitters will print a warning if more than 10 listeners are
// added for a particular event. This is a useful default which helps finding
// memory leaks. Obviously not all Emitters should be limited to 10. This function
// allows that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  this.maxListeners = n;
};

EventEmitter.prototype._addToList = function(list, eventName, listener) {
  var self = this;
  // Check that we have a container for the event, Create listener array
  if (typeof list[eventName] == 'undefined') list[eventName] = [];

  // Make sure the listener is not in there already?
  // We have to comment this to be compliant with node.js
  // list[eventName] = _.without(list[eventName], listener);

  // Add the listener and Check the limit
  return self._checkListenerLimit(eventName, list[eventName].push(listener));
};

// Adds a listener to the end of the listeners array for the specified event.
// server.on('connection', function (stream) {
//   console.log('someone connected!');
// });
// Returns emitter, so calls can be chained.
EventEmitter.prototype.on = function(eventName, listener) {
  var warn = this._addToList(this.onListeners, eventName, listener);

  // Warn if needed
  if (warn) console.warn((new Error(warn)).stack);

  // Return the emitter
  return self;
};

// Adds a one time listener for the event. This listener is invoked
// only the next time the event is fired, after which it is removed.
EventEmitter.prototype.once = function(eventName, listener) {
  var warn = this._addToList(this.onceListeners, eventName, listener);

  // Warn if needed
  if (warn) console.warn((new Error(warn)).stack);

  // Return the emitter
  return self;
};

var _runCallbacks = function(listenerArray, args) {
  // count of listeners triggered
  var count = 0;
  // Check if we have anything to work with
  if (typeof listenerArray !== 'undefined') {
    // Try to iterate over the listeners
    _.each(listenerArray, function(listener) {
      // Count listener calls
      count++;
      // Send the job to the eventloop
      Meteor.setTimeout(function emittedEvent() {
        // We'll let the event loop call the listener
        listener.apply(window, args);
      }, 0);
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
  var args = _.rest(arguments);
  
  // Count listeners triggered
  var count = 0;

  // Swap once list
  var onceList = self.onceListeners[eventName];

  // Empty the once list
  self.onceListeners[eventName] = [];

  // Trigger on listeners
  count += _runCallbacks(self.onListeners[eventName], args);

  // Trigger once listeners
  count += _runCallbacks(onceList, args);
  
  // Returns true if event had listeners, false otherwise.
  return (count > 0);
};

// XXX: When removing a listener in node js it only removes one - not all.
var _withoutOne = function(list, obj) {
  var found = false;
  var result = [];

  // Iterate over listeners
  for (var i = 0; i < list.length; i++)
    // Check if we found one...
    if (!found && list[i] === obj) found = true; else result.push(list[i]);

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
    if (typeof listener == 'function') {
      // its a bit more tricky - we have to iterate over the arrays and only
      // clone listeners not equal to
      if (typeof self.onListeners[eventName] !== 'undefined') {
        self.onListeners[eventName] = _withoutOne(self.onListeners[eventName], listener);
        
      }
      if (typeof self.onceListeners[eventName] !== 'undefined') {
        self.onceListeners[eventName] = _withoutOne(self.onceListeners[eventName], listener);
        
      }
    } else {
      // Remove all listeners for eventName
      self.onListeners[eventName] = [];
      self.onceListeners[eventName] = [];
    }

  } else {
    // Remove all listeners
    self.onListeners = {};
    self.onceListeners = {};
  }
};

// Add api helpers
EventEmitter.prototype.addListener = EventEmitter.prototype.on;
EventEmitter.prototype.removeListener = EventEmitter.prototype.off;
EventEmitter.prototype.removeAllListeners = EventEmitter.prototype.off;

// Add jquery like helpers
EventEmitter.prototype.one = EventEmitter.prototype.once;
EventEmitter.prototype.trigger = EventEmitter.prototype.emit;