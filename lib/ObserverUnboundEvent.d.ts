import { Event } from "./Event";
import { BindableObserver } from "./BindableObserver";
/**
 * Event emitte3d when a BindableObserver is unbound from another
 * BindableObserver using unbind().
 */
export declare class ObserverUnboundEvent extends Event {
    /**
     * Observer whose `unbind()` function is being called.
     */
    bindingObserver: BindableObserver;
    /**
     * Observer that is being unbound from `bindingObserver`
     */
    boundedObserver: BindableObserver;
    constructor(bindingObserver: BindableObserver, boundedObserver: BindableObserver);
    get name(): string;
    get uniqueName(): string;
}
