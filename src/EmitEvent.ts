import { Event } from "./Event";

/**
 * Event executed when another event is emitted by an BindableObserver.
 */
export class EmitEvent extends Event {
	/**
	 * @inheritdoc this.emitted
	 */
	private _emitted: Event;

	public constructor(event: Event) {
		super();

		this._emitted = event;
	}


	/**
	 * Event that was emitted.
	 */
	public get emitted(): Event {
		return this._emitted;
	}


	public get name(): string { return "Event Invoked"; }

	public get uniqueName(): string { return "LoganGerber-BindableObserver-EmitEvent"; }
}
