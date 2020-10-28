"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BindableObserver = exports.ObserverUnboundEvent = exports.ObserverBoundEvent = exports.CacheLimitChangedEvent = exports.ListenerRemovedEvent = exports.ListenerBoundEvent = exports.EmitterChangedEvent = exports.NonUniqueNameRegisteredError = exports.UndefinedEmitterError = exports.EmitEvent = exports.Event = void 0;
var Event_1 = require("./Event");
Object.defineProperty(exports, "Event", { enumerable: true, get: function () { return Event_1.Event; } });
var EmitEvent_1 = require("./EmitEvent");
Object.defineProperty(exports, "EmitEvent", { enumerable: true, get: function () { return EmitEvent_1.EmitEvent; } });
var UndefinedEmitterError_1 = require("./UndefinedEmitterError");
Object.defineProperty(exports, "UndefinedEmitterError", { enumerable: true, get: function () { return UndefinedEmitterError_1.UndefinedEmitterError; } });
var NonUniqueNameRegisteredError_1 = require("./NonUniqueNameRegisteredError");
Object.defineProperty(exports, "NonUniqueNameRegisteredError", { enumerable: true, get: function () { return NonUniqueNameRegisteredError_1.NonUniqueNameRegisteredError; } });
var EmitterChangedEvent_1 = require("./EmitterChangedEvent");
Object.defineProperty(exports, "EmitterChangedEvent", { enumerable: true, get: function () { return EmitterChangedEvent_1.EmitterChangedEvent; } });
var ListenerBoundEvent_1 = require("./ListenerBoundEvent");
Object.defineProperty(exports, "ListenerBoundEvent", { enumerable: true, get: function () { return ListenerBoundEvent_1.ListenerBoundEvent; } });
var ListenerRemovedEvent_1 = require("./ListenerRemovedEvent");
Object.defineProperty(exports, "ListenerRemovedEvent", { enumerable: true, get: function () { return ListenerRemovedEvent_1.ListenerRemovedEvent; } });
var CacheLimitChangedEvent_1 = require("./CacheLimitChangedEvent");
Object.defineProperty(exports, "CacheLimitChangedEvent", { enumerable: true, get: function () { return CacheLimitChangedEvent_1.CacheLimitChangedEvent; } });
var ObserverBoundEvent_1 = require("./ObserverBoundEvent");
Object.defineProperty(exports, "ObserverBoundEvent", { enumerable: true, get: function () { return ObserverBoundEvent_1.ObserverBoundEvent; } });
var ObserverUnboundEvent_1 = require("./ObserverUnboundEvent");
Object.defineProperty(exports, "ObserverUnboundEvent", { enumerable: true, get: function () { return ObserverUnboundEvent_1.ObserverUnboundEvent; } });
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
     * If no constructor or instance is given, a BindableObserver will still be
     * constructed. However, any functions involving events will result in
     * errors being thrown, until an emitter is provided using the
     * setEmitter() function.
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
     * Similarly, calling removeAllListeners() will only remove listeners bound
     * with the BindableObserver. Any listeners bound with the emitter will not
     * be affected in any way. However, calling removeAllListeners() on the
     * emitter will still remove any listeners bound with the BindableObserver.
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
        /**
         * Map that relates each Event type with its own symbol internal to the
         * BindableObserver. These symbols are what are bound to the emitter.
         */
        this.eventSymbolMap = new Map();
        /**
         * Map that relates each symbol to the Event that was used to generate it.
         *
         * This is used in removeAllListeners(). The event strings/symbols from the
         * emitter are iterated through, and the constructors are got using this
         * member.
         */
        this.inverseSymbolMap = new Map();
        /**
         * Internal registry of unique names from Events, and the Events they were
         * obtained from.
         *
         * This is not used in BindableObserver, but can be used in children of
         * BindableObserver. For example, it can be used to assist in serialization
         * or deserialization of Events.
         */
        this.uniqueNameMap = new Map();
        /**
         * Mapping of Events to user-defined symbols.
         */
        this.overrideEventSymbolMap = new Map();
        /**
         * When setEventSymbol() is called, and the Event's uniqueName has already
         * been registered in this BindableObserver, should an error be thrown? If
         * false, setEventSymbol() returns `false` instead of throwing an error.
         */
        this.throwNonUniqueNameErrors = true;
        this.relays = [];
        this.idCache = [];
        this.idCacheLimit = 100;
        this.doCacheLimitChangeEvents = true;
        this.doEmitterChangedEvents = true;
        this.doEmitEvents = true;
        this.doListenerBoundEvents = true;
        this.doListenerRemovedEvents = true;
        this.doObserverBoundEvents = true;
        this.doObserverUnboundEvents = true;
        this.emitEventSymbol = this.getOrCreateEventSymbol(EmitEvent_1.EmitEvent);
        if (eventEmitter) {
            this.setEmitter.apply(this, __spreadArrays([eventEmitter], args));
        }
    }
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
    Object.defineProperty(BindableObserver.prototype, "emitCacheLimitChangeEvents", {
        /**
         * Whether this BindableObserver should emit `CacheLimitChangeEvent`s.
         *
         * @returns if `CacheLimitChangeEvent`s are being emitted or not.
         */
        get: function () {
            return this.doCacheLimitChangeEvents;
        },
        /**
         * Whether this BindableObserver should emit `CacheLimitChangeEvent`s.
         *
         * @param val if `CacheLimitChangeEvent`s should be emitted or not.
         */
        set: function (val) {
            this.doCacheLimitChangeEvents = val;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BindableObserver.prototype, "emitEmitterChangedEvents", {
        /**
         * Whether this BindableObserver should emit `EmitterChangedEvent`s.
         *
         * @returns if `EmitterChangedEvent`s are being emitted or not.
         */
        get: function () {
            return this.doEmitterChangedEvents;
        },
        /**
         * Whether this BindableObserver should emit `EmitterChangedEvent`s.
         *
         * @param val if `EmitterChangedEvent`s should be emitted or not.
         */
        set: function (val) {
            this.doEmitterChangedEvents = val;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BindableObserver.prototype, "emitEmitEvents", {
        /**
         * Whether this BindableObserver should emit `EmitEvent`s.
         *
         * @returns if `EmitEvent`s are being emitted or not.
         */
        get: function () {
            return this.doEmitEvents;
        },
        /**
         * Whether this BindableObserver should emit `EmitEvent`s.
         *
         * @param val if `EmitEvent`s should be emitted or not.
         */
        set: function (val) {
            this.doEmitEvents = val;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BindableObserver.prototype, "emitListenerBoundEvents", {
        /**
         * Whether this BindableObserver should emit `ListenerBoundEvent`s.
         *
         * @returns if `ListenerBoundEvent`s are being emitted or not.
         */
        get: function () {
            return this.doListenerBoundEvents;
        },
        /**
         * Whether this BindableObserver should emit `ListenerBoundEvent`s.
         *
         * @param val if `ListenerBoundEvent`s should be emitted or not.
         */
        set: function (val) {
            this.doListenerBoundEvents = val;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BindableObserver.prototype, "emitListenerRemovedEvents", {
        /**
         * Whether this BindableObserver should emit `ListenerRemovedEvent`s.
         *
         * @returns if `ListenerRemovedEvent`s are being emitted or not.
         */
        get: function () {
            return this.doListenerRemovedEvents;
        },
        /**
         * Whether this BindableObserver should emit `ListenerRemovedEvent`s.
         *
         * @param val if `ListenerRemovedEvent`s should be emitted or not.
         */
        set: function (val) {
            this.doListenerRemovedEvents = val;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BindableObserver.prototype, "emitObserverBoundEvents", {
        /**
         * Whether this BindableObserver should emit `ObserverBoundEvent`s.
         *
         * @returns if `ObserverBoundEvent`s are being emitted or not.
         */
        get: function () {
            return this.doObserverBoundEvents;
        },
        /**
         * Whether this BindableObserver should emit `ObserverBoundEvent`s.
         *
         * @param val if `ObserverBoundEvent`s should be emitted or not.
         */
        set: function (val) {
            this.doObserverBoundEvents = val;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BindableObserver.prototype, "emitObserverUnboundEvents", {
        /**
         * Whether this BindableObserver should emit `ObserverUnboundEvent`s.
         *
         * @returns if `ObserverUnboundEvent`s are being emitted or not.
         */
        get: function () {
            return this.doObserverUnboundEvents;
        },
        /**
         * Whether this BindableObserver should emit `ObserverUnboundEvent`s.
         *
         * @param val if `ObserverUnboundEvent`s should be emitted or not.
         */
        set: function (val) {
            this.doObserverUnboundEvents = val;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BindableObserver.prototype, "throwOnNonUniqueEventName", {
        /**
         * When setEventSymbol() is called, and the Event's uniqueName has already
         * been registered in this BindableObserver, should an error be thrown? If
         * false, setEventSymbol() returns `false` instead of throwing an error.
         *
         * @returns if an error should be thrown when registering an Event without a
         * unique name.
         */
        get: function () {
            return this.throwNonUniqueNameErrors;
        },
        /**
         * When setEventSymbol() is called, and the Event's uniqueName has already
         * been registered in this BindableObserver, should an error be thrown? If
         * false, setEventSymbol() returns `false` instead of throwing an error.
         *
         * @param val if an error should be thrown when registering an Event without
         * a unique name.
         */
        set: function (val) {
            this.throwNonUniqueNameErrors = val;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BindableObserver.prototype, "cacheLimit", {
        /**
         * Get the limit of how many entries can exist in the id cache.
         *
         * @returns The maximum number of ids that can exist in cache.
         */
        get: function () {
            return this.idCacheLimit;
        },
        /**
         * Set the limit of how many entries can exist in the id cache.
         *
         * If the id cache is shrunk to less than the size of the current number of
         * id entries, the oldest entries will be purged.
         *
         * Setting the limit to <= 0 will remove the limit.
         *
         * If the limit is successfully changed, a `CacheLimitChangedEvent` event
         * will be emitted.
         *
         * More info on how ids are stored can be found in
         * BindableObserver.prototype.emit documentation.
         *
         * @param limit The maximum number of ids to keep in cache. Setting to <= 0
         * removes the limit.
         *
         * @see BindableObserver.prototype.on for info about storing ids in cache.
         */
        set: function (limit) {
            if (limit <= 0) {
                limit = 0;
            }
            if (limit === this.idCacheLimit) {
                return;
            }
            var oldLimit = this.idCacheLimit;
            this.idCacheLimit = limit;
            var idCacheOverflow = this.idCache.length - limit;
            this.idCache.splice(0, idCacheOverflow);
            if (this.doCacheLimitChangeEvents && this.emitter) {
                this.emit(new CacheLimitChangedEvent_1.CacheLimitChangedEvent(this, oldLimit, limit));
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BindableObserver.prototype, "cacheSize", {
        /**
         * Get the current number of ids in cache.
         *
         * @returns The number of ids currently stored in cache.
         */
        get: function () {
            return this.idCache.length;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Remove all ids from the id cache
     */
    BindableObserver.prototype.clearCache = function () {
        this.idCache = [];
    };
    ;
    /**
     * Get the current internal EventEmitter.
     *
     * @returns The EventEmitter object used internally for handling events, or
     * `undefined` if there is no currently set emitter.
     */
    BindableObserver.prototype.getEmitter = function () {
        return this.emitter;
    };
    /**
     * Set or change the internal EventEmitter.
     *
     * Emits an `EmitterChangedEvent` before the emitter is changed.
     *
     * @see myBindableObserver.prototype.constructor for notes on how the
     * eventEmitter parameter is used.
     */
    BindableObserver.prototype.setEmitter = function (eventEmitter) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var newEmitter;
        if (typeof eventEmitter === "function") {
            newEmitter = new (eventEmitter.bind.apply(eventEmitter, __spreadArrays([void 0], args)))();
        }
        else if (this.emitter === eventEmitter) {
            return;
        }
        else {
            newEmitter = eventEmitter;
        }
        if (this.doEmitterChangedEvents && this.emitter) {
            this.emit(new EmitterChangedEvent_1.EmitterChangedEvent(this, this.emitter, newEmitter));
        }
        this.emitter = newEmitter;
    };
    /**
     * @alias BindableObserver.prototype.on
     */
    BindableObserver.prototype.addListener = function (event, listener) {
        return this.on(event, listener);
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
        if (this.emitter === undefined) {
            throw new UndefinedEmitterError_1.UndefinedEmitterError();
        }
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
        var eventSymbol = this.getOrCreateEventSymbol(event);
        if (!eventSymbol) {
            return false;
        }
        var ret = this.emitter.emit(eventSymbol, event);
        if (this.doEmitEvents) {
            var invokeEvent = new EmitEvent_1.EmitEvent(event);
            this.emitter.emit(this.getOrCreateEventSymbol(invokeEvent), invokeEvent);
        }
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
     * Emits a `ListenerBoundEvent` after binding the new listener.
     *
     * @param event The type of Event to bind to. This can either be an Event
     * class or an instance of an Event. Note: Binding to an instance of an
     * event will still allow the listener to be called when ANY instance of
     * that same event is emitted.
     * @param listener Callback to execute when the Event type is emitted.
     * @returns Reference to self.
     */
    BindableObserver.prototype.on = function (event, listener) {
        if (this.emitter === undefined) {
            throw new UndefinedEmitterError_1.UndefinedEmitterError();
        }
        var eventName = this.getOrCreateEventSymbol(event);
        if (!eventName) {
            return this;
        }
        this.emitter.on(eventName, listener);
        if (this.doListenerBoundEvents) {
            this.emit(new ListenerBoundEvent_1.ListenerBoundEvent(this, listener, (typeof event === "function" ? event : event.constructor), false));
        }
        return this;
    };
    /**
     * Same as BindableObserver.prototype.on, but the listener is immediately
     * unbound once it is called.
     *
     * Emits a `ListenerBoundEvent` after binding the new listener.
     *
     * @param event The type of Event to bind to. This can either be an Event
     * class or an instance of an Event. Note: Binding to an instance of an
     * event will still allow the listener to be called when ANY instance of
     * that same event is emitted.
     * @param listener Callback to execute when the Event type is emitted.
     * @returns Reference to self.
     */
    BindableObserver.prototype.once = function (event, listener) {
        if (this.emitter === undefined) {
            throw new UndefinedEmitterError_1.UndefinedEmitterError();
        }
        var eventName = this.getOrCreateEventSymbol(event);
        if (!eventName) {
            return this;
        }
        this.emitter.once(eventName, listener);
        if (this.doListenerBoundEvents) {
            this.emit(new ListenerBoundEvent_1.ListenerBoundEvent(this, listener, (typeof event === "function" ? event : event.constructor), true));
        }
        return this;
    };
    /**
     * Same as BindableObserver.prototype.on, but the listener is prepended to
     * the list of bound listeners. When the event is emitted, this listener
     * will have priority in execution order.
     *
     * Emits a `ListenerBoundEvent` after binding the new listener.
     *
     * @param event The type of Event to bind to. This can either be an Event
     * class or an instance of an Event. Note: Binding to an instance of an
     * event will still allow the listener to be called when ANY instance of
     * that same event is emitted.
     * @param listener Callback to execute when the Event type is emitted.
     * @returns Reference to self.
     */
    BindableObserver.prototype.prependListener = function (event, listener) {
        if (this.emitter === undefined) {
            throw new UndefinedEmitterError_1.UndefinedEmitterError();
        }
        var eventName = this.getOrCreateEventSymbol(event);
        if (!eventName) {
            return this;
        }
        this.emitter.prependListener(eventName, listener);
        if (this.doListenerBoundEvents) {
            this.emit(new ListenerBoundEvent_1.ListenerBoundEvent(this, listener, (typeof event === "function" ? event : event.constructor), false));
        }
        return this;
    };
    /**
     * Same as BindableObserver.prototype.once, but the listener is prepended to
     * the list of bound listeners. When the event is emitted, this listener
     * will have priority in execution order.
     *
     * Emits a `ListenerBoundEvent` after binding the new listener.
     *
     * @param event The type of Event to bind to. This can either be an Event
     * class or an instance of an Event. Note: Binding to an instance of an
     * event will still allow the listener to be called when ANY instance of
     * that same event is emitted.
     * @param listener Callback to execute when the Event type is emitted.
     * @returns Reference to self.
     */
    BindableObserver.prototype.prependOnceListener = function (event, listener) {
        if (this.emitter === undefined) {
            throw new UndefinedEmitterError_1.UndefinedEmitterError();
        }
        var eventName = this.getOrCreateEventSymbol(event);
        if (!eventName) {
            return this;
        }
        this.emitter.prependOnceListener(eventName, listener);
        if (this.doListenerBoundEvents) {
            this.emit(new ListenerBoundEvent_1.ListenerBoundEvent(this, listener, (typeof event === "function" ? event : event.constructor), true));
        }
        return this;
    };
    /**
     * Remove all listeners bound to a type of event. If event is omitted, all
     * listeners are removed from every event type.
     *
     * A `ListenerRemovedEvent` is emitted for each listener that was removed.
     *
     * NOTE: If the event is omitted, any listeners bound using the emitter will
     * not be affected. This only removes listeners bound to `Event`s.
     *
     * @param event The type of event to unbind from. This can either be an
     * Event class or an instance of an Event. If this parameter is omitted, all
     * listeners will be removed from every event.
     * @returns Reference to self.
     */
    BindableObserver.prototype.removeAllListeners = function (event) {
        if (this.emitter === undefined) {
            throw new UndefinedEmitterError_1.UndefinedEmitterError();
        }
        if (event) {
            var eventName = this.getEventSymbol(event);
            if (!eventName) {
                return this;
            }
            var listeners = [];
            // if eventName is the symbol for EmitEvent
            if (eventName === this.emitEventSymbol) {
                // Get all the EmitEvent listeners
                listeners = this.emitter.listeners(eventName);
                // filter out the listeners used for binding observers
                for (var _i = 0, _a = this.relays; _i < _a.length; _i++) {
                    var relay = _a[_i];
                    listeners.splice(listeners.indexOf(relay.bubbleFunction), 1);
                }
                // individually remove each remaining listener
                for (var _b = 0, listeners_1 = listeners; _b < listeners_1.length; _b++) {
                    var listener = listeners_1[_b];
                    this.emitter.removeListener(eventName, listener);
                }
            }
            else {
                if (this.doListenerRemovedEvents) {
                    listeners = this.emitter.listeners(eventName);
                }
                this.emitter.removeAllListeners(eventName);
            }
            if (this.doListenerRemovedEvents) {
                for (var _c = 0, listeners_2 = listeners; _c < listeners_2.length; _c++) {
                    var listener = listeners_2[_c];
                    this.emit(new ListenerRemovedEvent_1.ListenerRemovedEvent(this, listener, typeof event === "function" ? event : event.constructor));
                }
            }
        }
        else {
            for (var _d = 0, _e = this.emitter.eventNames(); _d < _e.length; _d++) {
                var event_1 = _e[_d];
                var eventType = void 0;
                if (typeof event_1 === "symbol" && (eventType = this.inverseSymbolMap.get(event_1))) {
                    this.removeAllListeners(eventType);
                }
            }
        }
        return this;
    };
    /**
     * Unbind a listener from an event.
     *
     * Emits a `ListenerRemovedEvent` if a listener was successfully removed.
     *
     * @param event Event the listener is bound to. This can either be an Event
     * class or an instance of an Event.
     * @param listener Listener to unbind.
     * @returns Reference to self.
     */
    BindableObserver.prototype.removeListener = function (event, listener) {
        if (this.emitter === undefined) {
            throw new UndefinedEmitterError_1.UndefinedEmitterError();
        }
        var eventName = this.getEventSymbol(event);
        if (!eventName) {
            return this;
        }
        if (this.hasListener(event, listener)) {
            this.emitter.removeListener(eventName, listener);
            if (this.doListenerRemovedEvents) {
                this.emit(new ListenerRemovedEvent_1.ListenerRemovedEvent(this, listener, typeof event === "function" ? event : event.constructor));
            }
        }
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
        if (this.emitter === undefined) {
            throw new UndefinedEmitterError_1.UndefinedEmitterError();
        }
        var eventName = this.getEventSymbol(event);
        if (!eventName) {
            return false;
        }
        return this.emitter.listeners(eventName).includes(listener);
    };
    /**
     * Bind a BindableObserver to this BindableObserver.
     *
     * Bound observers emit their events on the relay observer supplied.
     *
     * @param relay BindableObserver to bind to this observer.
     */
    BindableObserver.prototype.bind = function (relay) {
        if (this.relays.find(function (element) { return element.relay === relay; })) {
            return;
        }
        var bubble = BindableObserver.generateBubbleFunction(relay);
        var entry = {
            relay: relay,
            bubbleFunction: bubble,
        };
        this.relays.push(entry);
        // Binding to a relay means to bind this.emit to an EventInvokedEvent on relay.
        this.on(EmitEvent_1.EmitEvent, bubble);
        if (this.doObserverBoundEvents && this.emitter) {
            this.emit(new ObserverBoundEvent_1.ObserverBoundEvent(this, relay));
        }
    };
    /**
     * Check if a BindableObserver is bound to this observer.
     *
     * @param relay BindableObserver to check.
     * @returns True if the observer is bound to this observer, false otherwise.
     */
    BindableObserver.prototype.checkBinding = function (relay) {
        return this.relays.find(function (e) { return e.relay === relay; }) !== undefined;
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
        this.removeListener(EmitEvent_1.EmitEvent, found.bubbleFunction);
        if (this.doObserverUnboundEvents && this.emitter) {
            this.emit(new ObserverUnboundEvent_1.ObserverUnboundEvent(this, relay));
        }
    };
    /**
     * Gets the symbol corresponding to the given event.
     *
     * This symbol is used for binding or calling
     * `BindableObserver.prototype.emitter`.
     *
     * If the Event does not have a symbol already registered, a new symbol is
     * created using `BindableObserver.prototype.setEventSymbol(event)`.
     *
     * @param event Event type or instance to get a symbol for.
     * @returns A symbol representing the type of event given, or `undefined` if
     * `BindableObserver.prototype.setEventSymbol` was called and returned false.
     */
    BindableObserver.prototype.getOrCreateEventSymbol = function (event) {
        var constructor;
        if (typeof event === "function") {
            constructor = event;
        }
        else {
            constructor = event.constructor;
        }
        var overrideSymbol = this.overrideEventSymbolMap.get(constructor);
        if (overrideSymbol) {
            return overrideSymbol;
        }
        var sym = this.eventSymbolMap.get(constructor);
        if (!sym) {
            if (!this.registerEvent(event)) {
                return undefined;
            }
            sym = this.eventSymbolMap.get(constructor);
        }
        return sym;
    };
    BindableObserver.prototype.getEventSymbol = function (event) {
        var constructor;
        if (typeof event === "function") {
            constructor = event;
        }
        else {
            constructor = event.constructor;
        }
        var overrideSymbol = this.overrideEventSymbolMap.get(constructor);
        if (overrideSymbol) {
            return overrideSymbol;
        }
        return this.eventSymbolMap.get(constructor);
    };
    /**
     * Register an Event with the BindableObserver.
     *
     * This symbol is used for binding or calling the
     * BindableObserver.prototype.emitter.
     *
     * If the Event does not have a symbol already registered, a new symbol is
     * created using the Event's uniqueName property. If this uniqueName was
     * already used to create a symbol (i.e. it was found on a different Event
     * as well), one of two behaviors occur.
     * 1. If `BindableObserver.prototype.throwOnNonUniqueEventName` is set, a
     * `NonUniqueNameRegisteredError` is thrown.
     * 2. If `BindableObserver.prototype.throwOnNonUniqueEventName` is not set,
     * the function returns `false`.
     *
     * Events can be registered with a different `forceUniqueSymbol` setting
     * after being set once, without needing to remove them first.
     *
     * @param event Event type to create a symbol for.
     * @param forceUniqueSymbol allow this event to be registered without caring
     * about its uniqueName attribute. This is to assist when two different
     * Event types are registered with identical uniqueNames. Defaults to
     * `false`.Note: Internally, if forceUniqueSymbol is set, the Event
     * information is not populated into
     * `BindableObserver.prototype.eventSymbolMap`,
     * `BindableObserver.prototype.inverseSymbolMap`, or
     * `BindableObserver.prototype.uniqueNameMap`.
     * @returns `true` if the Event was successfully registered, `false`
     * otherwise if `BindableObserver.prototype.throwOnNonUniqueEventName` isn't
     * set.
     * @throws `NonUniqueNameRegisteredError` if the registered Event's
     * uniqueName was used on another registered Event, and
     * `BindableObserver.prototype.throwOnNonUniqueEventName` is set.
     */
    BindableObserver.prototype.registerEvent = function (event, forceUniqueSymbol) {
        if (forceUniqueSymbol === void 0) { forceUniqueSymbol = false; }
        var constructor;
        var name;
        // Get the constructor function for the event
        if (typeof event === "function") {
            constructor = event;
            name = (new event()).uniqueName;
        }
        else {
            constructor = event.constructor;
            name = event.uniqueName;
        }
        // Check if a symbol has already been made for the constructor
        var hasSymbol = this.eventSymbolMap.has(constructor);
        var hasOverrideSymbol = this.overrideEventSymbolMap.has(constructor);
        // If there already exists a symbol for the constructor, early return true.
        if (forceUniqueSymbol) {
            if (hasOverrideSymbol) {
                return true;
            }
        }
        else if (hasSymbol) {
            return true;
        }
        if (forceUniqueSymbol) {
            // If the symbol exists, but is switching between unique <-> nonUnique
            if (hasSymbol) {
                var oldSym = this.eventSymbolMap.get(constructor);
                this.eventSymbolMap.delete(constructor);
                this.uniqueNameMap.delete(name);
                this.overrideEventSymbolMap.set(constructor, oldSym);
            }
            else {
                var sym = Symbol(name);
                this.overrideEventSymbolMap.set(constructor, sym);
                this.inverseSymbolMap.set(sym, constructor);
            }
        }
        else {
            if (this.uniqueNameMap.has(name)) {
                if (this.throwOnNonUniqueEventName) {
                    throw new NonUniqueNameRegisteredError_1.NonUniqueNameRegisteredError(name, this.uniqueNameMap.get(name), constructor);
                }
                else {
                    return false;
                }
            }
            if (hasOverrideSymbol) {
                var oldSym = this.overrideEventSymbolMap.get(constructor);
                this.overrideEventSymbolMap.delete(constructor);
                this.eventSymbolMap.set(constructor, oldSym);
                this.uniqueNameMap.set(name, constructor);
            }
            else {
                var symbol = Symbol(name);
                this.eventSymbolMap.set(constructor, symbol);
                this.inverseSymbolMap.set(symbol, constructor);
                this.uniqueNameMap.set(name, constructor);
            }
        }
        return true;
    };
    /**
     * Unregister an Event from the BindableObserver.
     *
     * Note: This function does not remove any listeners that might be bound to
     * this Event.
     *
     * @param event Event to unregister from the BindableObserver.
     * @returns `true` if the Event was successfully unregistered, `false`
     * otherwise.
     */
    BindableObserver.prototype.unregisterEvent = function (event) {
        var constructor;
        var name;
        if (typeof event === "function") {
            constructor = event;
            name = (new event()).uniqueName;
        }
        else {
            constructor = event.constructor;
            name = event.uniqueName;
        }
        if (this.overrideEventSymbolMap.delete(constructor)) {
            return true;
        }
        if (!this.eventSymbolMap.has(constructor)) {
            return false;
        }
        var oldSym = this.eventSymbolMap.get(constructor);
        this.eventSymbolMap.delete(constructor);
        this.inverseSymbolMap.delete(oldSym);
        this.uniqueNameMap.delete(name);
        return true;
    };
    return BindableObserver;
}());
exports.BindableObserver = BindableObserver;
