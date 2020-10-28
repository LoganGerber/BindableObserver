import { Event } from "./Event";
/**
 * Event executed when another event is emitted by an BindableObserver.
 */
export declare class EmitEvent extends Event {
    /**
     * Event that was emitted.
     */
    emitted: Event;
    constructor(event: Event);
    name(): string;
    get uniqueName(): string;
}
