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
	 * @inheritdoc this.observer
	 */
	private _observer: BindableObserver;

	/**
	 * @inheritdoc this.formerEmitter
	 */
	private _formerEmitter: EventEmitter;

	/**
	 * @inheritdoc this.newEmitter
	 */
	private _newEmitter: EventEmitter;


	public constructor(observer: BindableObserver, formerEmitter: EventEmitter, newEmitter: EventEmitter) {
		super();

		this._observer = observer;
		this._formerEmitter = formerEmitter;
		this._newEmitter = newEmitter;
	}


	/**
	 * Observer this event was emitted from
	 */
	public get observer(): BindableObserver {
		return this._observer;
	}

	/**
	 * Old emitter being replaced in the `observer`
	 */
	public get formerEmitter(): EventEmitter {
		return this._formerEmitter;
	}

	/**
	 * New emitter being used in the `observer`
	 */
	public get newEmitter(): EventEmitter {
		return this._newEmitter;
	}


	public get name(): string { return "Emitter Changed"; }

	public get uniqueName(): string { return "LoganGerber-BindableObserver-EmitterChangedEvent"; }
}
