import { Event } from "./Event";
import { BindableObserver } from "./BindableObserver";
/**
 * Event emitted whenever a BindableObserver is bound to another
 * BindableObserver using bind(), or when a bound observer's RelayFlags are
 * changed.
 */
export declare class ObserverBoundEvent extends Event {
    /**
     * @inheritdoc this.bindingObserver
     */
    private _bindingObserver;
    /**
     * @inheritdoc this.boundedObserver
     */
    private _boundedObserver;
    constructor(bindingObserver: BindableObserver, boundedObserver: BindableObserver);
    /**
     * Observer whose `bind()` function is being called.
     */
    get bindingObserver(): BindableObserver;
    /**
     * Observer that is being bound to the `bindingObserver`.
     */
    get boundedObserver(): BindableObserver;
    get name(): string;
    get uniqueName(): string;
}
