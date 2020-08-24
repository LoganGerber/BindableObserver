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
export declare class InternalEmitterChangedEvent extends Event {
    observer: BindableObserver;
    formerEmitter: EventEmitter;
    newEmitter: EventEmitter;
    constructor(observer: BindableObserver, formerEmitter: EventEmitter, newEmitter: EventEmitter);
    name(): string | symbol;
}
