import { Event } from "./Event";

/**
 * Event executed when another event is emitted by an BindableObserver.
 */
export class EmitEvent extends Event {
    /**
     * Event that was emitted.
     */
    emitted: Event;

    constructor(event: Event) {
        super();

        this.emitted = event;
    }

    name(): string | symbol {
        return "Event Invoked";
    }
}
