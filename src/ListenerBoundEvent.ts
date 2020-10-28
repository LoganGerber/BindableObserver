import { Event } from "./Event";
import { BindableObserver } from "./BindableObserver";

/**
 * Event emitted whenever a listener is bound to an Event through any binding function.
 */
export class ListenerBoundEvent extends Event {
    /**
     * Observer this event was created from
     */
    public observer: BindableObserver;

    /**
     * Listener that was added to the `observer`
     */
    public listener: (event: Event) => void;

    /**
     * Event the `listener` was bound on
     */
    public event: new (...args: any[]) => Event;

    /**
     * Is the `listener` bound using one of the `once()` functions?
     */
    public once: boolean;

    constructor(observer: BindableObserver, listener: (event: Event) => void, event: new (...args: any[]) => Event, once: boolean) {
        super();

        this.observer = observer;
        this.listener = listener;
        this.event = event;
        this.once = once;
    }

    name(): string { return "Listener Bound"; }

    get uniqueName(): string { return "LoganGerber-BindableObserver-ListenerBoundEvent"; }
}
