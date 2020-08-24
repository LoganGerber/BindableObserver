import { Event } from "./Event";
import { BindableObserver } from "./BindableObserver";
/**
 * Event emitted whenever a listener is bound to an Event through any binding function.
 */
export declare class ListenerBoundEvent extends Event {
    /**
     * Observer this event was created from
     */
    observer: BindableObserver;
    /**
     * Listener that was added to the `observer`
     */
    listener: (event: Event) => void;
    /**
     * Event the `listener` was bound on
     */
    event: new (...args: any[]) => Event;
    /**
     * Is the `listener` bound using one of the `once()` functions?
     */
    once: boolean;
    constructor(observer: BindableObserver, listener: (event: Event) => void, event: new (...args: any[]) => Event, once: boolean);
    name(): string;
}
