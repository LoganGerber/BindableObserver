/// <reference types="node" />
import { Event } from "./Event";
import { EventEmitter } from "events";
import { BindableObserver } from "./BindableObserver";
/**
 * Event called when a BindableObserver's setInternalEmitter() function is
 * called.
 *
 * This is only emitted on the emitter that is being replaced, and not the
 * new emitter being set.
 */
export declare class EmitterChangedEvent extends Event {
    /**
     * @inheritdoc this.observer
     */
    private _observer;
    /**
     * @inheritdoc this.formerEmitter
     */
    private _formerEmitter;
    /**
     * @inheritdoc this.newEmitter
     */
    private _newEmitter;
    constructor(observer: BindableObserver, formerEmitter: EventEmitter, newEmitter: EventEmitter);
    /**
     * Observer this event was emitted from
     */
    get observer(): BindableObserver;
    /**
     * Old emitter being replaced in the `observer`
     */
    get formerEmitter(): EventEmitter;
    /**
     * New emitter being used in the `observer`
     */
    get newEmitter(): EventEmitter;
    get name(): string;
    get uniqueName(): string;
}
