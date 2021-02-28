import { Event } from "./Event";
import { BindableObserver } from "./BindableObserver";
/**
 * Event emitted whenever a listener is bound to an Event through any binding function.
 */
export declare class ListenerBoundEvent extends Event {
    /**
     * @inheritdoc this.observer
     */
    private _observer;
    /**
     * @inheritdoc this.listener
     */
    private _listener;
    /**
     * @inheritdoc this.event
     */
    private _event;
    /**
     * @inheritdoc this.once
     */
    private _once;
    constructor(observer: BindableObserver, listener: (event: Event) => void, event: new (...args: any[]) => Event, once: boolean);
    /**
     * Observer this event was created from
     */
    get observer(): BindableObserver;
    /**
     * Listener that was added to the `observer`
     */
    get listener(): (event: Event) => void;
    /**
     * Event the `listener` was bound on
     */
    get event(): new (...args: any[]) => Event;
    /**
     * Is the `listener` bound using one of the `once()` functions?
     */
    get once(): boolean;
    get name(): string;
    get uniqueName(): string;
}
