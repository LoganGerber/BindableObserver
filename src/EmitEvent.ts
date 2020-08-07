import { Event } from "./Event";

/**
 * Event executed when another event is emitted by an EventObserver.
 */
export class EmitEvent extends Event {
    data: Event;

    constructor(data: Event) {
        super(data);
    }

    name(): string | symbol {
        return "Event Invoked";
    }
}
