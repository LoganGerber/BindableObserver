import { Event } from "./Event";

/**
 * Event executed when another event is emitted by an EventObserver.
 */
export class EmitEvent extends Event {
    emitted: Event;

    constructor(event: Event) {
        super();

        this.emitted = event;
    }

    name(): string | symbol {
        return "Event Invoked";
    }
}
