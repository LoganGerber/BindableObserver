import { Event } from "./Event";
import { BindableObserver } from "./BindableObserver";

/**
 * Event emitted whenever a listener is removed.
 */
export class ListenerRemovedEvent extends Event {
    /**
     * Observer this event was created from
     */
    public observer: BindableObserver;

    /**
     * Listener that was removed from the `observer`
     */
    public listener: (event: Event) => void;

    /**
     * Event that the `listener` was bound to
     */
    public event: new (...args: any[]) => Event;

    constructor(observer: BindableObserver, listener: (event: Event) => void, event: new (...args: any[]) => Event) {
        super();

        this.observer = observer;
        this.listener = listener;
        this.event = event;
    }

    name(): string { return "Listener Removed"; }

    get uniqueName(): string { return "LoganGerber-BindableObserver-ListenerRemovedEvent"; }
}
