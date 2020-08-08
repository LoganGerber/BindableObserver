import { Guid } from "guid-typescript";

/**
 * Class that represents an event to be handled by an BindableObserver.
 */
export abstract class Event {
    readonly id: Guid;

    constructor() {
        this.id = Guid.create();
    }

    /**
     * Human-readable name of the Event.
     */
    abstract name(): string | symbol;
}
