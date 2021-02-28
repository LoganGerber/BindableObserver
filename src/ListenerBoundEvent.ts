import { Event } from "./Event";
import { BindableObserver } from "./BindableObserver";

/**
 * Event emitted whenever a listener is bound to an Event through any binding function.
 */
export class ListenerBoundEvent extends Event {
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

	/**
	 * @inheritdoc this.once
	 */
	private _once: boolean;

	public constructor(observer: BindableObserver, listener: (event: Event) => void, event: new (...args: any[]) => Event, once: boolean) {
		super();

		this._observer = observer;
		this._listener = listener;
		this._event = event;
		this._once = once;
	}

	/**
	 * Observer this event was created from
	 */
	public get observer(): BindableObserver {
		return this._observer;
	}

	/**
	 * Listener that was added to the `observer`
	 */
	public get listener(): (event: Event) => void {
		return this._listener;
	}

	/**
	 * Event the `listener` was bound on
	 */
	public get event(): new (...args: any[]) => Event {
		return this._event;
	}

	/**
	 * Is the `listener` bound using one of the `once()` functions?
	 */
	public get once(): boolean {
		return this._once;
	}


	public get name(): string { return "Listener Bound"; }

	public get uniqueName(): string { return "LoganGerber-BindableObserver-ListenerBoundEvent"; }
}
