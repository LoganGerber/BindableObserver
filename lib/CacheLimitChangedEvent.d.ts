import { Event } from "./Event";
import { BindableObserver } from "./BindableObserver";
/**
 * Event executed when a BindableObserver's cache limit is changed.
 */
export declare class CacheLimitChangedEvent extends Event {
    /**
     * @inheritdoc this.observer
     */
    private _observer;
    /**
     * @inheritdoc this.formerLimit
     */
    private _formerLimit;
    /**
     * @inheritdoc this.newLimit
     */
    private _newLimit;
    constructor(observer: BindableObserver, formerLimit: number, newLimit: number);
    /**
     * BindableObserver this event was emitted from.
     */
    get observer(): BindableObserver;
    /**
     * Former cache limit.
     */
    get formerLimit(): number;
    /**
     * New cache limit.
     */
    get newLimit(): number;
    get name(): string;
    get uniqueName(): string;
}
