import { v1 as UUID } from "uuid";

/**
 * Class that represents an event to be handled by an BindableObserver.
 */
export abstract class Event {
    /**
     * Unique ID of the Event instance.
     */
    readonly id: string;

    constructor() {
        this.id = UUID();
    }

    /**
     * Human-readable name for the Event.
     * 
     * This name should not be used as an identifier for the event, as it is not
     * required to be unique from other events.
     */
    abstract get name(): string;

    /**
     * Unique name of the Event.
     * 
     * This name is suppose to be globally unique to the Event type, because it
     * will be used to identify the Event type to the BindableObserver. It will
     * also be used to identify the Event type during serialization and
     * deserialization.
     * 
     * It will be recommended to "namespace" the name in the following way:
     * `authorname-projectname-eventname`.
     * 
     * Note: This function must never reference "this"
     */
    abstract get uniqueName(): string;
}
