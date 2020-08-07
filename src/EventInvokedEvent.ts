import { Event } from "./Event";

export class EventInvokedEvent extends Event {
    data: Event;

    constructor(data: Event) {
        super(data);
    }

    name(): string | symbol {
        return "Event Invoked";
    }
}
