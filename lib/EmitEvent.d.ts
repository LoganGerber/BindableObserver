import { Event } from "./Event";
/**
 * Event executed when another event is emitted by an BindableObserver.
 */
export declare class EmitEvent extends Event {
    emitted: Event;
    constructor(event: Event);
    name(): string | symbol;
}
