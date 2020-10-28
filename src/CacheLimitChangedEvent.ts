import { Event } from "./Event";
import { BindableObserver } from "./BindableObserver";

/**
 * Event executed when a BindableObserver's cache limit is changed.
 */
export class CacheLimitChangedEvent extends Event {
    /**
     * BindableObserver this event was emitted from.
     */
    public observer: BindableObserver;

    /**
     * Former cache limit.
     */
    public formerLimit: number;

    /**
     * New cache limit.
     */
    public newLimit: number;

    constructor(observer: BindableObserver, formerLimit: number, newLimit: number) {
        super();

        this.observer = observer;
        this.formerLimit = formerLimit;
        this.newLimit = newLimit;
    }

    name(): string { return "Cache Limit Changed"; }

    get uniqueName(): string { return "LoganGerber-BindableObserver-CacheLimitChangedEvent"; }
}
