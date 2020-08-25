/// <reference types="node" />
import { EventEmitter } from "events";
import { Event } from "./Event";
import { EmitEvent } from "./EmitEvent";
import { UndefinedEmitterError } from "./UndefinedEmitterError";
import { EmitterChangedEvent } from "./EmitterChangedEvent";
import { ListenerBoundEvent } from "./ListenerBoundEvent";
import { ListenerRemovedEvent } from "./ListenerRemovedEvent";
import { CacheLimitChangedEvent } from "./CacheLimitChangedEvent";
import { ObserverBoundEvent } from "./ObserverBoundEvent";
import { ObserverUnboundEvent } from "./ObserverUnboundEvent";
export { Event };
export { EmitEvent };
export { UndefinedEmitterError };
export { EmitterChangedEvent };
export { ListenerBoundEvent };
export { ListenerRemovedEvent };
export { CacheLimitChangedEvent };
export { ObserverBoundEvent };
export { ObserverUnboundEvent };
/**
 * Type representing the structure of a listener callback.
 */
declare type Listener<T extends Event> = (x: Readonly<T>) => void;
/**
 * Valid types for passing to most BindableObserver functions that take an
 * event.
 *
 * The only function that does not use this is BindableObserver.prototype.emit,
 * as it requires specifically an Event.
 *
 * This type allows the user to, for example, call
 * ```ts
 *  myBindableObserver.on(MyEventType, () => {});
 * ```
 * or
 * ```ts
 * let eventInstance = new MyEventType();
 * myBindableObserver.on(eventInstance, () => {});
 * ```
 * and both behave identically.
 */
declare type EventType<T extends Event> = T | (new (...args: any) => T);
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
export declare class BindableObserver {
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
    static getRegisterableEventName<T extends Event>(event: EventType<T>): string;
    /**
     * Create the function that will be used to relay events from one
     * BindableObserver to another.
     *
     * @param observer The BindableObserver whose emit function will be called.
     * @returns A function that is bindable to an event and that will call
     * observer.emit, emitting an EventInvokedEvent provided as a parameter.
     */
    private static generateBubbleFunction;
    /**
     * Get or create a symbol corresponding to the given event.
     *
     * This symbol is used for binding or calling the
     * BindableObserver.prototype.emitter.
     *
     * @param event Event type or instance to get a symbol for.
     * @returns A symbol representing the type of event given.
     */
    private static getEventSymbol;
    /**
     * Map that relates each Event type with its own symbol internal to the
     * BindableObserver. These symbols are what are bound to the emitter.
     */
    private static symbolMap;
    /**
     * Map that relates each symbol to the Event that was used to generate it.
     */
    private static inverseSymbolMap;
    private static emitEventSymbol;
    /**
     * List of BindableObservers bound to this BindableObserver, as well as the
     * functions registered to bind the two.
     */
    private relays;
    /**
     * Cache of previously-emitted event ids. If an event is emitted, and its id
     * is found in here, the emit is canceled without anything happening.
     */
    private idCache;
    /**
     * Limit of how many entries can exist in the idCache array.
     */
    private idCacheLimit;
    /**
     * Should CacheLimitChangeEvents be emitted?
     */
    private doCacheLimitChangeEvents;
    /**
     * Should EmitterChangedEvents be emitted?
     */
    private doEmitterChangedEvents;
    /**
     * Should EmitEvents be emitted?
     */
    private doEmitEvents;
    /**
     * Should ListenerBoundEvents be emitted?
     */
    private doListenerBoundEvents;
    /**
     * Should ListenerRemovedEvents be emitted?
     */
    private doListenerRemovedEvents;
    /**
     * Should ObserverBoundEvents be emitted?
     */
    private doObserverBoundEvents;
    /**
     * Should ObserverUnboundEvents be emitted?
     */
    private doObserverUnboundEvents;
    /**
     * Underlying EventEmitter used to handle event binding and emit.
     */
    protected emitter: EventEmitter | undefined;
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
    constructor(eventEmitter?: (new (...args: any[]) => EventEmitter) | EventEmitter, ...args: any[]);
    /**
     * Whether this BindableObserver should emit `CacheLimitChangeEvent`s.
     *
     * @returns if `CacheLimitChangeEvent`s are being emitted or not.
     */
    get emitCacheLimitChangeEvents(): boolean;
    /**
     * Whether this BindableObserver should emit `CacheLimitChangeEvent`s.
     *
     * @param val if `CacheLimitChangeEvent`s should be emitted or not.
     */
    set emitCacheLimitChangeEvents(val: boolean);
    /**
     * Whether this BindableObserver should emit `EmitterChangedEvent`s.
     *
     * @returns if `EmitterChangedEvent`s are being emitted or not.
     */
    get emitEmitterChangedEvents(): boolean;
    /**
     * Whether this BindableObserver should emit `EmitterChangedEvent`s.
     *
     * @param val if `EmitterChangedEvent`s should be emitted or not.
     */
    set emitEmitterChangedEvents(val: boolean);
    /**
     * Whether this BindableObserver should emit `EmitEvent`s.
     *
     * @returns if `EmitEvent`s are being emitted or not.
     */
    get emitEmitEvents(): boolean;
    /**
     * Whether this BindableObserver should emit `EmitEvent`s.
     *
     * @param val if `EmitEvent`s should be emitted or not.
     */
    set emitEmitEvents(val: boolean);
    /**
     * Whether this BindableObserver should emit `ListenerBoundEvent`s.
     *
     * @returns if `ListenerBoundEvent`s are being emitted or not.
     */
    get emitListenerBoundEvents(): boolean;
    /**
     * Whether this BindableObserver should emit `ListenerBoundEvent`s.
     *
     * @param val if `ListenerBoundEvent`s should be emitted or not.
     */
    set emitListenerBoundEvents(val: boolean);
    /**
     * Whether this BindableObserver should emit `ListenerRemovedEvent`s.
     *
     * @returns if `ListenerRemovedEvent`s are being emitted or not.
     */
    get emitListenerRemovedEvents(): boolean;
    /**
     * Whether this BindableObserver should emit `ListenerRemovedEvent`s.
     *
     * @param val if `ListenerRemovedEvent`s should be emitted or not.
     */
    set emitListenerRemovedEvents(val: boolean);
    /**
     * Whether this BindableObserver should emit `ObserverBoundEvent`s.
     *
     * @returns if `ObserverBoundEvent`s are being emitted or not.
     */
    get emitObserverBoundEvents(): boolean;
    /**
     * Whether this BindableObserver should emit `ObserverBoundEvent`s.
     *
     * @param val if `ObserverBoundEvent`s should be emitted or not.
     */
    set emitObserverBoundEvents(val: boolean);
    /**
     * Whether this BindableObserver should emit `ObserverUnboundEvent`s.
     *
     * @returns if `ObserverUnboundEvent`s are being emitted or not.
     */
    get emitObserverUnboundEvents(): boolean;
    /**
     * Whether this BindableObserver should emit `ObserverUnboundEvent`s.
     *
     * @param val if `ObserverUnboundEvent`s should be emitted or not.
     */
    set emitObserverUnboundEvents(val: boolean);
    /**
     * Get the limit of how many entries can exist in the id cache.
     *
     * @returns The maximum number of ids that can exist in cache.
     */
    get cacheLimit(): number;
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
    set cacheLimit(limit: number);
    /**
     * Get the current number of ids in cache.
     *
     * @returns The number of ids currently stored in cache.
     */
    get cacheSize(): number;
    /**
     * Remove all ids from the id cache
     */
    clearCache(): void;
    /**
     * Get the current internal EventEmitter.
     *
     * @returns The EventEmitter object used internally for handling events, or
     * `undefined` if there is no currently set emitter.
     */
    getEmitter(): EventEmitter | undefined;
    /**
     * Set or change the internal EventEmitter.
     *
     * Emits an `EmitterChangedEvent` before the emitter is changed.
     *
     * @see myBindableObserver.prototype.constructor for notes on how the
     * eventEmitter parameter is used.
     */
    setEmitter(eventEmitter: (new (...args: any[]) => EventEmitter) | EventEmitter, ...args: any[]): void;
    /**
     * @alias BindableObserver.prototype.on
     */
    addListener<T extends Event>(event: EventType<T>, listener: Listener<T>): this;
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
    emit(event: Event): boolean;
    /**
     * @alias BindableObserver.prototype.removeListener
     */
    off<T extends Event>(event: EventType<T>, listener: Listener<T>): this;
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
    on<T extends Event>(event: EventType<T>, listener: Listener<T>): this;
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
    once<T extends Event>(event: EventType<T>, listener: Listener<T>): this;
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
    prependListener<T extends Event>(event: EventType<T>, listener: Listener<T>): this;
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
    prependOnceListener<T extends Event>(event: EventType<T>, listener: Listener<T>): this;
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
    removeAllListeners<T extends Event>(event?: EventType<T>): this;
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
    removeListener<T extends Event>(event: EventType<T>, listener: Listener<T>): this;
    /**
     * Check if a listener is bound to a specific event.
     *
     * @param event Event the listener would be bound to. This can either be an
     * Event class or an instance of an Event.
     * @param listener Listener to check for.
     * @returns True if the listener is bound to the event, false otherwise.
     */
    hasListener<T extends Event>(event: EventType<T>, listener: Listener<T>): boolean;
    /**
     * Bind a BindableObserver to this BindableObserver.
     *
     * Bound observers emit their events on the relay observer supplied.
     *
     * @param relay BindableObserver to bind to this observer.
     */
    bind(relay: BindableObserver): void;
    /**
     * Check if a BindableObserver is bound to this observer.
     *
     * @param relay BindableObserver to check.
     * @returns True if the observer is bound to this observer, false otherwise.
     */
    checkBinding(relay: BindableObserver): boolean;
    /**
     * Unbind a BindableObserver from this BindableObserver.
     *
     * If the provided observer is not bound to this observer, this is a no-op
     * function.
     *
     * @param relay BindableObserver to unbind from this.
     */
    unbind(relay: BindableObserver): void;
}
