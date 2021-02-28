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
export class EmitterChangedEvent extends Event {
	/**
	 * Observer this event was emitted from
	 */
	public observer: BindableObserver;

	/**
	 * Old emitter being replaced in the `observer`
	 */
	public formerEmitter: EventEmitter;

	/**
	 * New emitter being used in the `observer`
	 */
	public newEmitter: EventEmitter;


	constructor(observer: BindableObserver, formerEmitter: EventEmitter, newEmitter: EventEmitter) {
		super();

		this.observer = observer;
		this.formerEmitter = formerEmitter;
		this.newEmitter = newEmitter;
	}


	get name(): string { return "Emitter Changed"; }

	get uniqueName(): string { return "LoganGerber-BindableObserver-EmitterChangedEvent"; }
}
