import { Event } from "./Event";
import { BindableObserver } from "./BindableObserver";
/**
 * Event emitted whenever a listener is removed.
 */
export declare class ListenerRemovedEvent extends Event {
    /**
     * Observer this event was created from
     */
    observer: BindableObserver;
    /**
     * Listener that was removed from the `observer`
     */
    listener: (event: Event) => void;
    /**
     * Event that the `listener` was bound to
     */
    event: new (...args: any[]) => Event;
    constructor(observer: BindableObserver, listener: (event: Event) => void, event: new (...args: any[]) => Event);
    get name(): string;
    get uniqueName(): string;
}
