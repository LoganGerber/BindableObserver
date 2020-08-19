"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BindableObserver = exports.RelayFlags = void 0;
var EmitEvent_1 = require("./EmitEvent");
// Re-export other classes
var Event_1 = require("./Event");
Object.defineProperty(exports, "Event", { enumerable: true, get: function () { return Event_1.Event; } });
var EmitEvent_2 = require("./EmitEvent");
Object.defineProperty(exports, "EmitEvent", { enumerable: true, get: function () { return EmitEvent_2.EmitEvent; } });
/**
 * Flags used to track how two BindableObservers are bound.
 *
 * - RelayFlags.From sends the bound observer's events to the binding observer.
 * - RelayFlags.To sends the binding observer's events to the bound observer.
 * - RelayFlags.All sends all events from either observer to the other.
 * - RelayFlags.None sends no events between the observers.
 */
var RelayFlags;
(function (RelayFlags) {
    RelayFlags[RelayFlags["None"] = 0] = "None";
    RelayFlags[RelayFlags["To"] = 1] = "To";
    RelayFlags[RelayFlags["From"] = 2] = "From";
    RelayFlags[RelayFlags["All"] = 3] = "All";
})(RelayFlags = exports.RelayFlags || (exports.RelayFlags = {}));
/**
 * Implementation of an Observer pattern bindable to other BindableObservers.
 *
 * BindableObserver is not an EventEmitter, and cannot be used as an
 * EventEmitter. This is because anywhere where an EventEmitter would accept a
 * string or symbol as an event, the BindableObserver takes an Event object.
 *
 * The BindableObserver takes Event objects because it needs to track each
 * event's id. This is so that when two or more BindableObservers are bound to
 * one another, an event is not infinitely emitted between the two.
 *
 * Despite the fact that BindableObserver cannot be used as an EventEmitter, it
 * shares all the same function names with EventEmitter. This is to make the
 * functions intuitive for the user.
 *
 * Underlying, BindableObserver uses a class derived from EventEmitter to emit
 * events. Specify which EventEmitter type is to be used using the generic
 * parameter.
 */
var BindableObserver = /** @class */ (function () {
    /**
     * Construct a new BindableObserver using the given EventEmitter constructor
     * or EventEmitter subclass instance.
     *
     * The constructor will be used to create or set the underlying EventEmitter
     * that will handle emitting events.
     *
     * If constructing a BindableObserver with an instance of an EventEmitter,
     * any preexisting bindings (or bindings made to the instance after
     * constructing the BindableObserver) will not be altared. The EventEmitter
     * instance will still behave normally.
     *
     * When calling events via the EventEmitter, no events bound via the
     * BindableObserver will be executed. Likewise, when calling events bound
     * via the BindableObserver, no events bound to the EventEmitter will be
     * executed.
     *
     * NOTE: While calling events from one does not interfere with the other,
     * binding an Event class to a listener via BindableObserver will still
     * invoke a 'newListener' event in the EventEmitter.
     *
     * @param eventEmitter The type or instance of EventEmitter to use
     * underlying the BindableObserver.
     */
    function BindableObserver(eventEmitter) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.relays = [];
        this.idCache = [];
        this.idCacheLimit = 100;
        this.symbolMap = new Map();
        if (typeof eventEmitter === "function") {
            this.internalEmitter = new (eventEmitter.bind.apply(eventEmitter, __spreadArrays([void 0], args)))();
        }
        else {
            this.internalEmitter = eventEmitter;
        }
    }
    /**
     * Change an EventType<T> to a string that can be used to register as an
     * event in the underlying EventEmitter.
     *
     * If the provided event is a function, that means the user passed the class
     * itself as a parameter. If it's not a function, that means the user passed
     * an instance of an event.
     *
     * The function returns the class's name, which should be unique to a given
     * type of Event in any one process. This is how event name collisions are
     * avoided when binding Events to listeners.
     *
     * @param event Event to get a name from to use as an EventEmitter event.
     * @returns Name of the event class.
     */
    BindableObserver.getRegisterableEventName = function (event) {
        if (typeof event === "function") {
            return event.name;
        }
        return event.constructor.name;
    };
    /**
     * Create the function that will be used to relay events from one
     * BindableObserver to another.
     *
     * @param observer The BindableObserver whose emit function will be called.
     * @returns A function that is bindable to an event and that will call
     * observer.emit, emitting an EventInvokedEvent provided as a parameter.
     */
    BindableObserver.generateBubbleFunction = function (observer) {
        return function (event) {
            observer.emit(event.emitted);
        };
    };
    /**
     * Get the limit of how many entries can exist in the id cache.
     *
     * @returns The maximum number of ids that can exist in cache.
     */
    BindableObserver.prototype.getIdCacheLimit = function () {
        return this.idCacheLimit;
    };
    /**
     * Set the limit of how many entries can exist in the id cache.
     *
     * If the id cache is shrunk to less than the size of the current number of
     * id entries, the oldest entries will be purged.
     *
     * Setting the limit to <= 0 will remove the limit.
     *
     * More info on how ids are stored can be found in
     * BindableObserver.prototype.emit documentation.
     *
     * @param limit The maximum number of ids to keep in cache. Setting to <= 0
     * removes the limit.
     *
     * @see BindableObserver.prototype.on for info about storing ids in cache.
     */
    BindableObserver.prototype.setIdCacheLimit = function (limit) {
        if (limit <= 0) {
            this.idCacheLimit = 0;
            return;
        }
        this.idCacheLimit = limit;
        var idCacheOverflow = this.idCache.length - limit;
        this.idCache.splice(0, idCacheOverflow);
    };
    /**
     * Get the current number of ids in cache.
     *
     * @returns The number of ids currently stored in cache.
     */
    BindableObserver.prototype.getIdCacheSize = function () {
        return this.idCache.length;
    };
    /**
     * Remove all ids from the id cache
     */
    BindableObserver.prototype.clearIdCache = function () {
        this.idCache = [];
    };
    ;
    /**
     * @alias BindableObserver.prototype.on
     */
    BindableObserver.prototype.addListener = function (event, listener) {
        var eventName = this.getEventSymbol(event);
        this.internalEmitter.addListener(eventName, listener);
        return this;
    };
    /**
     * Emit an event.
     *
     * When an event is emitted, its id is first compared with the cache of
     * stored ids. If its id is found in the cache, emit is terminated early,
     * returning `false`.
     *
     * If the event's id is not found in the cache, the id is stored in the
     * cache and emit continues to call any listeners bound to the event.
     *
     * When an event is emitted, a second event, an `EventInvokedEvent` is
     * also emitted, with the original event as its data. This event's id is
     * not stored in the id cache.
     *
     * @param event Event to emit.
     * @returns True if any listeners were called for the event, false
     * otherwise.
     */
    BindableObserver.prototype.emit = function (event) {
        // Check if the event has been processed already.
        if (this.idCache.includes(event.id)) {
            return false;
        }
        // Remove the oldest id if the cache limit is being exceeded
        if (this.idCacheLimit > 0 && this.idCache.length === this.idCacheLimit) {
            this.idCache.shift();
        }
        // Add the event id to the id cache
        this.idCache.push(event.id);
        var ret = this.internalEmitter.emit(this.getEventSymbol(event), event);
        var invokeEvent = new EmitEvent_1.EmitEvent(event);
        this.internalEmitter.emit(this.getEventSymbol(invokeEvent), invokeEvent);
        return ret;
    };
    /**
     * @alias BindableObserver.prototype.removeListener
     */
    BindableObserver.prototype.off = function (event, listener) {
        return this.removeListener(event, listener);
    };
    /**
     * Bind a listener to an event.
     *
     * A listener is any function callback. Listeners will be called with a
     * single parameter: the event instance that triggered them.
     *
     * @param event The type of Event to bind to. This can either be an Event
     * class or an instance of an Event. Note: Binding to an instance of an
     * event will still allow the listener to be called when ANY instance of
     * that same event is emitted.
     * @param listener Callback to execute when the Event type is emitted.
     * @returns Reference to self.
     */
    BindableObserver.prototype.on = function (event, listener) {
        var eventName = this.getEventSymbol(event);
        this.internalEmitter.on(eventName, listener);
        return this;
    };
    /**
     * Same as BindableObserver.prototype.on, but the listener is immediately unbound once it is
     * called.
     *
     * @param event The type of Event to bind to. This can either be an Event
     * class or an instance of an Event. Note: Binding to an instance of an
     * event will still allow the listener to be called when ANY instance of
     * that same event is emitted.
     * @param listener Callback to execute when the Event type is emitted.
     * @returns Reference to self.
     */
    BindableObserver.prototype.once = function (event, listener) {
        var eventName = this.getEventSymbol(event);
        this.internalEmitter.once(eventName, listener);
        return this;
    };
    /**
     * Same as BindableObserver.prototype.on, but the listener is prepended to the list of bound
     * listeners. When the event is emitted, this listener will have priority
     * in execution order.
     *
     * @param event The type of Event to bind to. This can either be an Event
     * class or an instance of an Event. Note: Binding to an instance of an
     * event will still allow the listener to be called when ANY instance of
     * that same event is emitted.
     * @param listener Callback to execute when the Event type is emitted.
     * @returns Reference to self.
     */
    BindableObserver.prototype.prependListener = function (event, listener) {
        var eventName = this.getEventSymbol(event);
        this.internalEmitter.prependListener(eventName, listener);
        return this;
    };
    /**
     * Same as BindableObserver.prototype.once, but the listener is prepended to the list of bound
     * listeners. When the event is emitted, this listener will have priority
     * in execution order.
     *
     * @param event The type of Event to bind to. This can either be an Event
     * class or an instance of an Event. Note: Binding to an instance of an
     * event will still allow the listener to be called when ANY instance of
     * that same event is emitted.
     * @param listener Callback to execute when the Event type is emitted.
     * @returns Reference to self.
     */
    BindableObserver.prototype.prependOnceListener = function (event, listener) {
        var eventName = this.getEventSymbol(event);
        this.internalEmitter.prependOnceListener(eventName, listener);
        return this;
    };
    /**
     * Remove all listeners bound to a type of event. If event is omitted, all
     * listeners are removed from every event type.
     *
     * @param event The type of event to unbind from. This can either be an
     * Event class or an instance of an Event. If this parameter is omitted, all
     * listeners will be removed from every event.
     * @returns Reference to self.
     */
    BindableObserver.prototype.removeAllListeners = function (event) {
        if (event) {
            var eventName = this.getEventSymbol(event);
            this.internalEmitter.removeAllListeners(eventName);
        }
        else {
            this.internalEmitter.removeAllListeners();
        }
        return this;
    };
    /**
     * Unbind a listener from an event.
     *
     * @param event Event the listener is bound to. This can either be an Event
     * class or an instance of an Event.
     * @param listener Listener to unbind.
     * @returns Reference to self.
     */
    BindableObserver.prototype.removeListener = function (event, listener) {
        var eventName = this.getEventSymbol(event);
        this.internalEmitter.removeListener(eventName, listener);
        return this;
    };
    /**
     * Check if a listener is bound to a specific event.
     *
     * @param event Event the listener would be bound to. This can either be an
     * Event class or an instance of an Event.
     * @param listener Listener to check for.
     * @returns True if the listener is bound to the event, false otherwise.
     */
    BindableObserver.prototype.hasListener = function (event, listener) {
        var eventName = this.getEventSymbol(event);
        return this.internalEmitter.listeners(eventName).includes(listener);
    };
    /**
     * Bind a BindableObserver to this BindableObserver.
     *
     * Bound observers emit their events on the other observer as defined by
     * the RelayFlags supplied.
     *
     * - RelayFlags.None means neither observer sends their events to the other.
     * - RelayFlags.From means relay emits its events on this observer.
     * - RelayFlags.To means this observer emits its events on relay.
     * - RelayFlags.All means both observers emit their events on one another.
     *
     * If no RelayFlags argument is provided, RelayFlags.All is used as default.
     *
     * @param relay BindableObserver to bind to this observer.
     * @param relayFlags Direction events should be relayed. Default
     * RelayFlags.All.
     */
    BindableObserver.prototype.bind = function (relay, relayFlags) {
        if (relayFlags === void 0) { relayFlags = RelayFlags.All; }
        var found = this.relays.find(function (element) { return element.relay === relay; });
        if (!found) {
            found = {
                relay: relay,
                fromBubbleFunction: undefined,
                toBubbleFunction: undefined,
            };
            this.relays.push(found);
        }
        // Binding to a relay means to bind this.emit to an EventInvokedEvent on relay.
        if (relayFlags & RelayFlags.From) {
            if (!found.fromBubbleFunction) {
                var bubble = BindableObserver.generateBubbleFunction(this);
                relay.on(EmitEvent_1.EmitEvent, bubble);
                found.fromBubbleFunction = bubble;
            }
        }
        else if (found.fromBubbleFunction) {
            found.relay.removeListener(EmitEvent_1.EmitEvent, found.fromBubbleFunction);
            found.fromBubbleFunction = undefined;
        }
        if (relayFlags & RelayFlags.To) {
            if (!found.toBubbleFunction) {
                var bubble = BindableObserver.generateBubbleFunction(relay);
                this.on(EmitEvent_1.EmitEvent, bubble);
                found.toBubbleFunction = bubble;
            }
        }
        else if (found.toBubbleFunction) {
            this.removeListener(EmitEvent_1.EmitEvent, found.toBubbleFunction);
            found.toBubbleFunction = undefined;
        }
    };
    /**
     * Check how a BindableObserver is bound to this observer.
     *
     * @param relay BindableObserver to check.
     * @returns RelayFlags specifying the direction events are passed between
     * the two observers. If relay is not bound to this observer, the function
     * returns `undefined`.
     */
    BindableObserver.prototype.checkBinding = function (relay) {
        var found = this.relays.find(function (e) { return e.relay === relay; });
        if (!found) {
            return undefined;
        }
        return RelayFlags.None |
            (found.fromBubbleFunction ? RelayFlags.From : RelayFlags.None) |
            (found.toBubbleFunction ? RelayFlags.To : RelayFlags.None);
    };
    /**
     * Unbind a BindableObserver from this BindableObserver.
     *
     * If the provided observer is not bound to this observer, this is a no-op
     * function.
     *
     * @param relay BindableObserver to unbind from this.
     */
    BindableObserver.prototype.unbind = function (relay) {
        var foundIndex = this.relays.findIndex(function (element) { return element.relay === relay; });
        if (foundIndex === -1) {
            return;
        }
        var found = this.relays[foundIndex];
        this.relays.splice(foundIndex, 1);
        if (found.fromBubbleFunction) {
            found.relay.removeListener(EmitEvent_1.EmitEvent, found.fromBubbleFunction);
        }
        if (found.toBubbleFunction) {
            this.removeListener(EmitEvent_1.EmitEvent, found.toBubbleFunction);
        }
    };
    /**
     * Get or create a symbol corresponding to the given event.
     *
     * This symbol is used for binding or calling the internalEmitter.
     *
     * @param event Event type or instance to get a symbol for.
     * @returns A symbol representing the type of event given.
     */
    BindableObserver.prototype.getEventSymbol = function (event) {
        var constructor;
        if (typeof event === "function") {
            constructor = event;
        }
        else {
            constructor = event.constructor;
        }
        if (!this.symbolMap.has(constructor)) {
            this.symbolMap.set(constructor, Symbol(BindableObserver.getRegisterableEventName(event)));
        }
        return this.symbolMap.get(constructor);
    };
    return BindableObserver;
}());
exports.BindableObserver = BindableObserver;
