import { Event } from "./Event";
import { BindableObserver } from "./BindableObserver";

/**
 * Event emitte3d when a BindableObserver is unbound from another
 * BindableObserver using unbind().
 */
export class ObserverUnboundEvent extends Event {
    /**
     * Observer whose `unbind()` function is being called.
     */
    public bindingObserver: BindableObserver;

    /**
     * Observer that is being unbound from `bindingObserver`
     */
    public boundedObserver: BindableObserver;

    constructor(bindingObserver: BindableObserver, boundedObserver: BindableObserver) {
        super();

        this.bindingObserver = bindingObserver;
        this.boundedObserver = boundedObserver;
    }

    name(): string { return "Observer Unbound"; }

    get uniqueName(): string { return "LoganGerber-BindableObserver-ObserverUnboundEvent"; }
}
