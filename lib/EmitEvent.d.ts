import { Event } from "./Event";
/**
 * Event executed when another event is emitted by an BindableObserver.
 */
export declare class EmitEvent extends Event {
    /**
     * @inheritdoc this.emitted
     */
    private _emitted;
    constructor(event: Event);
    /**
     * Event that was emitted.
     */
    get emitted(): Event;
    get name(): string;
    get uniqueName(): string;
}
