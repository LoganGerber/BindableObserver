import { Guid } from "guid-typescript";

/**
 * Class that represents an event to be handled by an EventObserver.
 */
export abstract class Event {
    readonly id: Guid;
    data: any;

    constructor(data?: any) {
        this.id = Guid.create();
        this.data = data;
    }

    /**
     * Human-readable name of the Event.
     */
    abstract name(): string | symbol;
}
