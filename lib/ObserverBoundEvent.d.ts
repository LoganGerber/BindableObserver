import { Event } from "./Event";
import { BindableObserver } from "./BindableObserver";
/**
 * Event emitted whenever a BindableObserver is bound to another
 * BindableObserver using bind(), or when a bound observer's RelayFlags are
 * changed.
 */
export declare class ObserverBoundEvent extends Event {
    /**
     * Observer whose `bind()` function is being called.
     */
    bindingObserver: BindableObserver;
    /**
     * Observer that is being bound to the `bindingObserver`.
     */
    boundedObserver: BindableObserver;
    constructor(bindingObserver: BindableObserver, boundedObserver: BindableObserver);
    get name(): string;
    get uniqueName(): string;
}
