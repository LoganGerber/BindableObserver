Extension of EventEmitter, that can allow events to be relayed to other EventEmitters.

The idea behind SimpleObserver is to make an observer pattern that can work for a more fully-fleshed out piece of software that uses events as its backbone. This software may want to broadcast some of its events (but not necessarily all) to other software.
