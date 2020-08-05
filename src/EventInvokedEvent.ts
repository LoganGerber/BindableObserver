import { Event } from "./Event";

export class EventInvokedEvent extends Event {
    data: Event;

    constructor(data: Event) {
        super("Event Invoked", data);
    }
}
