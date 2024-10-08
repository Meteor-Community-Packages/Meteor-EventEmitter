# raix:eventemitter

Isomorphic api for EventEmitter on server and browser,
should work like [Node.js EventEmitter](http://nodejs.org/api/events.html) on both client and server.

> note: this package is flagged as deprecated and maintained for package-version support.
> if you need an isomorphic event listener then look out for npm packages like
> eventlistener3 or nano events.

Overview:
* EventEmitter
* setMaxListeners(n)
* on(eventName, listener)
* once(eventName, listener)
* emit(eventName /* arguments */)
* off(eventName, listener)

Wrapper apis node js like:
* addListener(eventName, listener)
* removeListener(eventName, listener)
* removeAllListeners(eventName, listener)

Wrapper apis jQuery like:
* one(eventName, listener)
* trigger(eventName /* arguments */)

Tests are covered and will be extended as issues demand.

## Usage
Creating EventEmitter object
```
Meteor.isClient() {
    Event = new EventEmitter();
}
```

Emitting event
```
Event.emit('customEvent', {
    data: bar
});
```


Listening the event (at a template for instance)
```
var listener;
Template.example.created = function() {
    listener = function(bar) {
        console.log('Listening custom event', bar);
    };
    Event.on('customEvent', listener);
}

Template.example.destroyed = function() {
    Event.removeListener('customEvent', listener);
}

```

Kind regards RaiX
