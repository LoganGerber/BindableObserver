"use strict";
exports.__esModule = true;
exports.EventObserver = exports.RelayFlags = void 0;
var events_1 = require("events");
var EmitEvent_1 = require("./EmitEvent");
/**
 * Flags used to track how two EventObservers are bound.
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
 * Implementation of an Observer pattern bindable to other EventObservers.
 *
 * EventObserver is not an EventEmitter, and cannot be used as an EventEmitter.
 * This is because anywhere where an EventEmitter would accept a string or
 * symbol as an event, the EventObserver takes an Event object.
 *
 * The EventObserver takes Event objects because it needs to track each event's
 * id. This is so that when two or more EventObservers are bound to one
 * another, an event is not infinitely emitted between the two.
 *
 * Despite the fact that EventObserver cannot be used as an EventEmitter, it
 * shares all the same function names with EventEmitter. This is to make the
 * functions intuitive for the user.
 */
var EventObserver = /** @class */ (function () {
    function EventObserver() {
        /**
         * Underlying EventEmitter used to handle event binding and emit.
         */
        this.internalEmitter = new events_1.EventEmitter();
        /**
         * List of EventObservers bound to this EventObserver, as
         * well as the functions registered to bind the two.
         */
        this.relays = [];
        /**
         * Cache of previously-emitted event ids. If an event is emitted, and its id
         * is found in here, the emit is canceled without anything happening.
         */
        this.idCache = [];
        /**
         * Limit of how many entries can exist in the idCache array.
         */
        this.idCacheLimit = 100;
    }
    /**
     * Get the limit of how many entries can exist in the id cache.
     *
     * @returns The maximum number of ids that can exist in cache.
     */
    EventObserver.prototype.getIdCacheLimit = function () {
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
     * EventObserver.prototype.emit documentation.
     *
     * @param limit The maximum number of ids to keep in cache. Setting to <= 0
     * removes the limit.
     *
     * @see EventObserver.prototype.on for info about storing ids in cache.
     */
    EventObserver.prototype.setIdCacheLimit = function (limit) {
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
    EventObserver.prototype.getIdCacheSize = function () {
        return this.idCache.length;
    };
    /**
     * Remove all ids from the id cache
     */
    EventObserver.prototype.clearIdCache = function () {
        this.idCache = [];
    };
    ;
    /**
     * @alias EventObserver.prototype.on
     */
    EventObserver.prototype.addListener = function (event, listener) {
        var eventName = EventObserver.getRegisterableEventName(event);
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
    EventObserver.prototype.emit = function (event) {
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
        var ret = this.internalEmitter.emit(event.constructor.name, event);
        var invokeEvent = new EmitEvent_1.EmitEvent(event);
        this.internalEmitter.emit(invokeEvent.constructor.name, invokeEvent);
        return ret;
    };
    /**
     * @alias EventObserver.prototype.removeListener
     */
    EventObserver.prototype.off = function (event, listener) {
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
    EventObserver.prototype.on = function (event, listener) {
        var eventName = EventObserver.getRegisterableEventName(event);
        this.internalEmitter.on(eventName, listener);
        return this;
    };
    /**
     * Same as EventObserver.prototype.on, but the listener is immediately unbound once it is
     * called.
     *
     * @param event The type of Event to bind to. This can either be an Event
     * class or an instance of an Event. Note: Binding to an instance of an
     * event will still allow the listener to be called when ANY instance of
     * that same event is emitted.
     * @param listener Callback to execute when the Event type is emitted.
     * @returns Reference to self.
     */
    EventObserver.prototype.once = function (event, listener) {
        var eventName = EventObserver.getRegisterableEventName(event);
        this.internalEmitter.once(eventName, listener);
        return this;
    };
    /**
     * Same as EventObserver.prototype.on, but the listener is prepended to the list of bound
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
    EventObserver.prototype.prependListener = function (event, listener) {
        var eventName = EventObserver.getRegisterableEventName(event);
        this.internalEmitter.prependListener(eventName, listener);
        return this;
    };
    /**
     * Same as EventObserver.prototype.once, but the listener is prepended to the list of bound
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
    EventObserver.prototype.prependOnceListener = function (event, listener) {
        var eventName = EventObserver.getRegisterableEventName(event);
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
    EventObserver.prototype.removeAllListeners = function (event) {
        if (event) {
            var eventName = EventObserver.getRegisterableEventName(event);
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
    EventObserver.prototype.removeListener = function (event, listener) {
        var eventName = EventObserver.getRegisterableEventName(event);
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
    EventObserver.prototype.hasListener = function (event, listener) {
        var eventName = EventObserver.getRegisterableEventName(event);
        return this.internalEmitter.listeners(eventName).includes(listener);
    };
    /**
     * Bind a EventObserver to this EventObserver.
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
     * @param relay EventObserver to bind to this observer.
     * @param relayFlags Direction events should be relayed. Default
     * RelayFlags.All.
     */
    EventObserver.prototype.bind = function (relay, relayFlags) {
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
                var bubble = EventObserver.generateBubbleFunction(this);
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
                var bubble = EventObserver.generateBubbleFunction(relay);
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
     * Check how a EventObserver is bound to this observer.
     *
     * @param relay EventObserver to check.
     * @returns RelayFlags specifying the direction events are passed between
     * the two observers. If relay is not bound to this observer, the function
     * returns `undefined`.
     */
    EventObserver.prototype.checkBinding = function (relay) {
        var found = this.relays.find(function (e) { return e.relay === relay; });
        if (!found) {
            return undefined;
        }
        return RelayFlags.None |
            (found.fromBubbleFunction ? RelayFlags.From : RelayFlags.None) |
            (found.toBubbleFunction ? RelayFlags.To : RelayFlags.None);
    };
    /**
     * Unbind a EventObserver from this EventObserver.
     *
     * If the provided observer is not bound to this observer, this is a no-op
     * function.
     *
     * @param relay EventObserver to unbind from this.
     */
    EventObserver.prototype.unbind = function (relay) {
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
     * Create the function that will be used to relay events from one
     * EventObserver to another.
     *
     * @param observer The EventObserver whose emit function will be called.
     * @returns A function that is bindable to an event and that will call
     * observer.emit, emitting an EventInvokedEvent provided as a parameter.
     */
    EventObserver.generateBubbleFunction = function (observer) {
        return function (event) {
            observer.emit(event.emitted);
        };
    };
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
    EventObserver.getRegisterableEventName = function (event) {
        if (typeof event === "function") {
            return event.name;
        }
        return event.constructor.name;
    };
    return EventObserver;
}());
exports.EventObserver = EventObserver;
