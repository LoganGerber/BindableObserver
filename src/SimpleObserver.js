"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.SimpleObserver = void 0;
var events_1 = require("events");
var guid_typescript_1 = require("guid-typescript");
var sourceRelay = Symbol("sourceRelay");
var SimpleObserver = /** @class */ (function (_super) {
    __extends(SimpleObserver, _super);
    function SimpleObserver() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.relays = [];
        _this.idCache = [];
        _this.idCacheLimit = 100;
        return _this;
    }
    // Manage internal guid cache
    SimpleObserver.prototype.setIdCacheLimit = function (limit) {
        this.idCacheLimit = limit;
        if (limit <= 0) {
            return;
        }
        var idCacheOverflow = this.idCache.length - limit;
        this.idCache.splice(0, idCacheOverflow);
    };
    SimpleObserver.prototype.clearIdCache = function () {
        this.idCache = [];
    };
    ;
    SimpleObserver.prototype.addListener = function (event, listener) {
        return this.on(event, listener);
    };
    SimpleObserver.prototype.emit = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        // Guarantee that event is an IEvent.
        if (typeof event !== "object") {
            // If the event isn't an object, then it's a string or a symbol.
            // Check if the first argument is an event. If it is, assume this is the true event.
            if (args.length > 0 && SimpleObserver.isIEvent(args[0])) {
                event = args[0];
            }
            // Else, create an event using the args given.
            else {
                event = {
                    id: guid_typescript_1.Guid.create(),
                    name: event,
                    data: args
                };
            }
        }
        // Check if the event has been processed already.
        if (this.idCache.includes(event.id)) {
            return;
        }
        // Remove the oldest id if the cache limit is being exceeded
        if (this.idCache.length === this.idCacheLimit) {
            this.idCache.shift();
        }
        // Add the event id to the id cache
        this.idCache.push(event.id);
        var ret = _super.prototype.emit.call(this, event.name, event);
        // Go through each relay, emit the event on the relay
        var originRelay = undefined;
        if (event.hasOwnProperty(sourceRelay)) {
            originRelay = event[sourceRelay];
        }
        for (var _a = 0, _b = this.relays; _a < _b.length; _a++) {
            var relayEntry = _b[_a];
            var relay = relayEntry[0];
            if (relay !== originRelay) {
                if (relay instanceof SimpleObserver) {
                    ret = relay.emit(event) || ret;
                }
                else {
                    ret = relay.emit(event.name, event) || ret;
                }
            }
        }
        return ret;
    };
    SimpleObserver.prototype.off = function (event, listener) {
        return this.removeListener(event, listener);
    };
    SimpleObserver.prototype.on = function (event, listener) {
        event = this.changeEventForSuper(event);
        return _super.prototype.on.call(this, event, listener);
    };
    SimpleObserver.prototype.once = function (event, listener) {
        event = this.changeEventForSuper(event);
        return _super.prototype.once.call(this, event, listener);
    };
    SimpleObserver.prototype.prependListener = function (event, listener) {
        event = this.changeEventForSuper(event);
        return _super.prototype.prependListener.call(this, event, listener);
    };
    SimpleObserver.prototype.prependOnceListener = function (event, listener) {
        event = this.changeEventForSuper(event);
        return _super.prototype.prependOnceListener.call(this, event, listener);
    };
    SimpleObserver.prototype.removeAllListeners = function (event) {
        if (event) {
            event = this.changeEventForSuper(event);
            return _super.prototype.removeAllListeners.call(this, event);
        }
        return _super.prototype.removeAllListeners.call(this);
    };
    SimpleObserver.prototype.removeListener = function (event, listener) {
        event = this.changeEventForSuper(event);
        return _super.prototype.removeListener.call(this, event, listener);
    };
    // ability to attach a socket or other SimpleObserver
    SimpleObserver.prototype.bind = function (relay) {
        if (this.relays.find(function (element) { element[0] === relay; })) {
            return;
        }
        // relay.eventNames() to get all the current event names bound to relay
        var currentEvents = relay.eventNames();
        var eventBubbleFunctions = [];
        // For each name in the array, call relay.on(name, bubble)
        for (var _i = 0, currentEvents_1 = currentEvents; _i < currentEvents_1.length; _i++) {
            var event = currentEvents_1[_i];
            var bubble = this.bubbleFunctionGenerator(relay, event);
            eventBubbleFunctions.push([bubble, event]);
            relay.on(event, bubble);
        }
        // Register a new listener on relay.on('newListener') to generate a new bubble function if necessary
        var registerBubbleListener = this.registerNewBubbleFunctionGenerator(relay);
        relay.on('newListener', registerBubbleListener);
        // Register the list of event names for the relay internally for tracking
        this.relays.push([relay, registerBubbleListener, eventBubbleFunctions]);
        // TODO: Register a new listener on relay.on('removeListener') to see if a bubble event is no longer necessary in the relay. The intention behind this is to save memory in relays where the event isn't needed and can be deleted. However, this will also come with a performance hit, which may be not worth the effort.
        // The trouble with this is that there may be multiple SimpleObservers that register bubble listeners. This means it will need to somehow differentiate between regular listeners and bubble listeners that came from a SimpleObserver (or some potential child of SimpleObserver, which may override bubbleFunctionGenerator)
    };
    ;
    SimpleObserver.prototype.unbind = function (relay) {
        var foundIndex = this.relays.findIndex(function (element) { element[0] === relay; });
        if (foundIndex === -1) {
            return;
        }
        var relayInfo = this.relays[foundIndex];
        this.relays.splice(foundIndex, 1);
        relay.removeListener('newListener', relayInfo[1]);
        for (var _i = 0, _a = relayInfo[2]; _i < _a.length; _i++) {
            var eventInfo = _a[_i];
            relay.removeListener(eventInfo[1], eventInfo[0]);
        }
    };
    SimpleObserver.prototype.changeEventForSuper = function (event) {
        if (typeof event === "object") {
            event = event.name;
        }
        return event;
    };
    SimpleObserver.prototype.bubbleFunctionGenerator = function (relay, event) {
        var _this = this;
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var wrappedEvent;
            // TODO: It's possible the event was created from something that wasn't a SimpleObserver. In this case, if the first argument is an IEvent, it's possible the event was actually the data to the actual event that occured.
            // This isn't fixed by simply checking if the event name and the IEvent.name are equal, because it could be an event nested within the same kind of event.
            // This issue is caused by an inherent loss of information when passing a string or symbol as the event, rather than the IEvent itself.
            if (args.length > 0 && SimpleObserver.isIEvent(args[0])) {
                wrappedEvent = args[0];
            }
            else {
                wrappedEvent = {
                    id: guid_typescript_1.Guid.create(),
                    name: event,
                    data: args
                };
            }
            wrappedEvent[sourceRelay] = relay;
            _this.emit(wrappedEvent);
        };
    };
    SimpleObserver.prototype.registerNewBubbleFunctionGenerator = function (relay) {
        var _this = this;
        return function (event) {
            var foundIndex = _this.relays.findIndex(function (element) { return element[0] === relay; });
            if (foundIndex === -1) {
                return;
            }
            var hasEvent = _this.relays[foundIndex][2].find(function (element) { return element[1] === event; });
            if (!hasEvent) {
                var bubble = _this.bubbleFunctionGenerator(relay, event);
                _this.relays[foundIndex][2].push([bubble, event]);
                relay.on(event, bubble);
            }
        };
    };
    SimpleObserver.isIEvent = function (obj) {
        return 'id' in obj && guid_typescript_1.Guid.isGuid(obj.id) &&
            'name' in obj && (typeof obj.name === 'string' || typeof obj.name === 'symbol') &&
            'data' in obj;
    };
    return SimpleObserver;
}(events_1.EventEmitter));
exports.SimpleObserver = SimpleObserver;
