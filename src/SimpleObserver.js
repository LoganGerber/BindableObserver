"use strict";
exports.__esModule = true;
exports.SimpleObserver = exports.RelayFlags = void 0;
var events_1 = require("events");
var EventInvokedEvent_1 = require("./EventInvokedEvent");
/**
 * Flags used to track how two SimpleObservers are bound.
 */
var RelayFlags;
(function (RelayFlags) {
    RelayFlags[RelayFlags["None"] = 0] = "None";
    RelayFlags[RelayFlags["To"] = 1] = "To";
    RelayFlags[RelayFlags["From"] = 2] = "From";
    RelayFlags[RelayFlags["All"] = 3] = "All";
})(RelayFlags = exports.RelayFlags || (exports.RelayFlags = {}));
/**
 * Implementation of an Observer pattern bindable to other SimpleObservers.
 *
 *
 */
var SimpleObserver = /** @class */ (function () {
    function SimpleObserver() {
        this.internalEmitter = new events_1.EventEmitter();
        this.relays = [];
        this.idCache = [];
        this.eventInvokedIdCache = [];
        this.idCacheLimit = 100;
    }
    // Manage internal guid cache
    SimpleObserver.prototype.getIdCacheLimit = function () {
        return this.idCacheLimit;
    };
    SimpleObserver.prototype.setIdCacheLimit = function (limit) {
        if (limit <= 0) {
            this.idCacheLimit = 0;
            return;
        }
        this.idCacheLimit = limit;
        var idCacheOverflow = this.idCache.length - limit;
        this.idCache.splice(0, idCacheOverflow);
        this.eventInvokedIdCache.splice(0, idCacheOverflow);
    };
    SimpleObserver.prototype.getIdCacheSize = function () {
        return this.idCache.length;
    };
    SimpleObserver.prototype.clearIdCache = function () {
        this.idCache = [];
    };
    ;
    SimpleObserver.prototype.addListener = function (event, listener) {
        var eventName = this.getRegisterableEventName(event);
        this.internalEmitter.addListener(eventName, listener);
        return this;
    };
    SimpleObserver.prototype.emit = function (event) {
        // Check if the event has been processed already.
        if (this.idCache.includes(event.id) || this.eventInvokedIdCache.includes(event.id)) {
            return false;
        }
        // Remove the oldest id if the cache limit is being exceeded
        if (this.idCacheLimit > 0 && this.idCache.length === this.idCacheLimit) {
            this.idCache.shift();
            this.eventInvokedIdCache.shift();
        }
        // Add the event id to the id cache
        this.idCache.push(event.id);
        var ret = this.internalEmitter.emit(event.constructor.name, event);
        var invokeEvent = new EventInvokedEvent_1.EventInvokedEvent(event);
        this.eventInvokedIdCache.push(invokeEvent.id);
        ret = this.internalEmitter.emit(invokeEvent.constructor.name, invokeEvent) || ret;
        return ret;
    };
    SimpleObserver.prototype.off = function (event, listener) {
        return this.removeListener(event, listener);
    };
    SimpleObserver.prototype.on = function (event, listener) {
        var eventName = this.getRegisterableEventName(event);
        this.internalEmitter.on(eventName, listener);
        return this;
    };
    SimpleObserver.prototype.once = function (event, listener) {
        var eventName = this.getRegisterableEventName(event);
        this.internalEmitter.once(eventName, listener);
        return this;
    };
    SimpleObserver.prototype.prependListener = function (event, listener) {
        var eventName = this.getRegisterableEventName(event);
        this.internalEmitter.prependListener(eventName, listener);
        return this;
    };
    SimpleObserver.prototype.prependOnceListener = function (event, listener) {
        var eventName = this.getRegisterableEventName(event);
        this.internalEmitter.prependOnceListener(eventName, listener);
        return this;
    };
    SimpleObserver.prototype.removeAllListeners = function (event) {
        if (event) {
            var eventName = this.getRegisterableEventName(event);
            this.internalEmitter.removeAllListeners(eventName);
        }
        else {
            this.internalEmitter.removeAllListeners();
        }
        return this;
    };
    SimpleObserver.prototype.removeListener = function (event, listener) {
        var eventName = this.getRegisterableEventName(event);
        this.internalEmitter.removeListener(eventName, listener);
        return this;
    };
    SimpleObserver.prototype.hasListener = function (event, listener) {
        var eventName = this.getRegisterableEventName(event);
        return this.internalEmitter.listeners(eventName).includes(listener);
    };
    // ability to attach another SimpleObserver
    SimpleObserver.prototype.bind = function (relay, relayFlags) {
        if (relayFlags === void 0) { relayFlags = RelayFlags.All; }
        var found = this.relays.find(function (element) { return element.relay === relay; });
        if (!found) {
            found = {
                relay: relay,
                fromBubbleFunction: undefined,
                toBubbleFunction: undefined
            };
            this.relays.push(found);
        }
        // Binding to a relay means to bind this.emit to an EventInvokedEvent on relay.
        if (relayFlags & RelayFlags.From) {
            if (!found.fromBubbleFunction) {
                var bubble = this.generateBubbleFunction(this);
                relay.on(EventInvokedEvent_1.EventInvokedEvent, bubble);
                found.fromBubbleFunction = bubble;
            }
        }
        else if (found.fromBubbleFunction) {
            found.relay.removeListener(EventInvokedEvent_1.EventInvokedEvent, found.fromBubbleFunction);
            found.fromBubbleFunction = undefined;
        }
        if (relayFlags & RelayFlags.To) {
            if (!found.toBubbleFunction) {
                var bubble = this.generateBubbleFunction(relay);
                this.on(EventInvokedEvent_1.EventInvokedEvent, bubble);
                found.toBubbleFunction = bubble;
            }
        }
        else if (found.toBubbleFunction) {
            this.removeListener(EventInvokedEvent_1.EventInvokedEvent, found.toBubbleFunction);
            found.toBubbleFunction = undefined;
        }
    };
    SimpleObserver.prototype.checkBinding = function (relay) {
        var found = this.relays.find(function (e) { return e.relay === relay; });
        if (!found) {
            return undefined;
        }
        return RelayFlags.None |
            (found.fromBubbleFunction ? RelayFlags.From : RelayFlags.None) |
            (found.toBubbleFunction ? RelayFlags.To : RelayFlags.None);
    };
    SimpleObserver.prototype.unbind = function (relay) {
        var foundIndex = this.relays.findIndex(function (element) { return element.relay === relay; });
        if (foundIndex === -1) {
            return;
        }
        var found = this.relays[foundIndex];
        this.relays.splice(foundIndex, 1);
        if (found.fromBubbleFunction) {
            found.relay.removeListener(EventInvokedEvent_1.EventInvokedEvent, found.fromBubbleFunction);
        }
        if (found.toBubbleFunction) {
            this.removeListener(EventInvokedEvent_1.EventInvokedEvent, found.toBubbleFunction);
        }
    };
    SimpleObserver.prototype.generateBubbleFunction = function (observer) {
        return function (event) {
            observer.emit(event.data);
        };
    };
    SimpleObserver.prototype.getRegisterableEventName = function (event) {
        if (typeof event === "function") {
            return event.name;
        }
        return event.constructor.name;
    };
    return SimpleObserver;
}());
exports.SimpleObserver = SimpleObserver;
