import { Event } from "./Event";
import { BindableObserver } from "./BindableObserver";
/**
 * Event emitted whenever a listener is removed.
 */
export declare class ListenerRemovedEvent extends Event {
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
    constructor(observer: BindableObserver, listener: (event: Event) => void, event: new (...args: any[]) => Event);
    /**
     * Observer this event was created from
     */
    get observer(): BindableObserver;
    /**
     * Listener that was removed from the `observer`
     */
    get listener(): (event: Event) => void;
    /**
     * Event that the `listener` was bound to
     */
    get event(): new (...args: any[]) => Event;
    get name(): string;
    get uniqueName(): string;
}
