import { Guid } from "guid-typescript";
/**
 * Class that represents an event to be handled by an BindableObserver.
 */
export declare abstract class Event {
    readonly id: Guid;
    constructor();
    /**
     * Human-readable name of the Event.
     */
    abstract name(): string | symbol;
}
