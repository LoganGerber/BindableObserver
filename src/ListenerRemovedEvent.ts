import { Event } from "./Event";
import { BindableObserver } from "./BindableObserver";

/**
 * Event emitted whenever a listener is removed.
 */
export class ListenerRemovedEvent extends Event {
	/**
	 * @inheritdoc this.observer
	 */
	private _observer: BindableObserver;

	/**
	 * @inheritdoc this.listener
	 */
	private _listener: (event: Event) => void;

	/**
	 * @inheritdoc this.event
	 */
	private _event: new (...args: any[]) => Event;


	public constructor(observer: BindableObserver, listener: (event: Event) => void, event: new (...args: any[]) => Event) {
		super();

		this._observer = observer;
		this._listener = listener;
		this._event = event;
	}

	/**
	 * Observer this event was created from
	 */
	public get observer(): BindableObserver {
		return this._observer;
	}

	/**
	 * Listener that was removed from the `observer`
	 */
	public get listener(): (event: Event) => void {
		return this._listener;
	}

	/**
	 * Event that the `listener` was bound to
	 */
	public get event(): new (...args: any[]) => Event {
		return this._event;
	}


	public get name(): string { return "Listener Removed"; }

	public get uniqueName(): string { return "LoganGerber-BindableObserver-ListenerRemovedEvent"; }
}
