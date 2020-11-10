import { Event } from "./Event";
import { BindableObserver } from "./BindableObserver";
/**
 * Event executed when a BindableObserver's cache limit is changed.
 */
export declare class CacheLimitChangedEvent extends Event {
    /**
     * BindableObserver this event was emitted from.
     */
    observer: BindableObserver;
    /**
     * Former cache limit.
     */
    formerLimit: number;
    /**
     * New cache limit.
     */
    newLimit: number;
    constructor(observer: BindableObserver, formerLimit: number, newLimit: number);
    get name(): string;
    get uniqueName(): string;
}
