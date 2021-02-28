import { Event } from "./Event";
import { BindableObserver } from "./BindableObserver";
/**
 * Event emitte3d when a BindableObserver is unbound from another
 * BindableObserver using unbind().
 */
export declare class ObserverUnboundEvent extends Event {
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
    * Observer whose `unbind()` function is being called.
    */
    get bindingObserver(): BindableObserver;
    /**
    * Observer that is being unbound from `bindingObserver`
    */
    get boundedObserver(): BindableObserver;
    get name(): string;
    get uniqueName(): string;
}
