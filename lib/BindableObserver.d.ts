/// <reference types="node" />
import { EventEmitter } from "events";
import { Event } from "./Event";
export { Event } from "./Event";
export { EmitEvent } from "./EmitEvent";
/**
 * Type representing the structure of a listener callback.
 */
declare type Listener<T extends Event> = (x: T) => void;
/**
 * Valid types for passing to most BindableObserver functions that take an
 * event.
 *
 * The only function that does not use this is BindableObserver.prototype.emit, as
 * it requires specifically an Event.
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
 * Flags used to track how two BindableObservers are bound.
 *
 * - RelayFlags.From sends the bound observer's events to the binding observer.
 * - RelayFlags.To sends the binding observer's events to the bound observer.
 * - RelayFlags.All sends all events from either observer to the other.
 * - RelayFlags.None sends no events between the observers.
 */
export declare enum RelayFlags {
    None = 0,
    To = 1,
    From = 2,
    All = 3
}
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
export declare class BindableObserver<E extends EventEmitter> {
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
     * List of BindableObservers bound to this BindableObserver, as
     * well as the functions registered to bind the two.
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
     * Map that relates each Event type with its own symbol internal to the
     * BindableObserver. These symbols are what are bound to the
     * internalEmitter.
     */
    private symbolMap;
    /**
     * Underlying EventEmitter used to handle event binding and emit.
     */
    protected internalEmitter: E;
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
    constructor(eventEmitter: (new (...args: any[]) => E) | E, ...args: any[]);
    /**
     * Get the limit of how many entries can exist in the id cache.
     *
     * @returns The maximum number of ids that can exist in cache.
     */
    getIdCacheLimit(): number;
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
    setIdCacheLimit(limit: number): void;
    /**
     * Get the current number of ids in cache.
     *
     * @returns The number of ids currently stored in cache.
     */
    getIdCacheSize(): number;
    /**
     * Remove all ids from the id cache
     */
    clearIdCache(): void;
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
     * @param event The type of Event to bind to. This can either be an Event
     * class or an instance of an Event. Note: Binding to an instance of an
     * event will still allow the listener to be called when ANY instance of
     * that same event is emitted.
     * @param listener Callback to execute when the Event type is emitted.
     * @returns Reference to self.
     */
    on<T extends Event>(event: EventType<T>, listener: Listener<T>): this;
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
    once<T extends Event>(event: EventType<T>, listener: Listener<T>): this;
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
    prependListener<T extends Event>(event: EventType<T>, listener: Listener<T>): this;
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
    prependOnceListener<T extends Event>(event: EventType<T>, listener: Listener<T>): this;
    /**
     * Remove all listeners bound to a type of event. If event is omitted, all
     * listeners are removed from every event type.
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
    bind<T extends EventEmitter>(relay: BindableObserver<T>, relayFlags?: RelayFlags): void;
    /**
     * Check how a BindableObserver is bound to this observer.
     *
     * @param relay BindableObserver to check.
     * @returns RelayFlags specifying the direction events are passed between
     * the two observers. If relay is not bound to this observer, the function
     * returns `undefined`.
     */
    checkBinding<T extends EventEmitter>(relay: BindableObserver<T>): RelayFlags | undefined;
    /**
     * Unbind a BindableObserver from this BindableObserver.
     *
     * If the provided observer is not bound to this observer, this is a no-op
     * function.
     *
     * @param relay BindableObserver to unbind from this.
     */
    unbind<T extends EventEmitter>(relay: BindableObserver<T>): void;
    /**
     * Get or create a symbol corresponding to the given event.
     *
     * This symbol is used for binding or calling the internalEmitter.
     *
     * @param event Event type or instance to get a symbol for.
     * @returns A symbol representing the type of event given.
     */
    private getEventSymbol;
}
