raix:eventEmitter [![Build Status](https://travis-ci.org/raix/Meteor-EventEmitter.svg)](https://travis-ci.org/raix/Meteor-EventEmitter)
============

Api should work like [Node.js EventEmitter](http://nodejs.org/api/events.html) on both client and server.

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

Kind regards RaiX