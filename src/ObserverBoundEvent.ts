import { Event } from "./Event";
import { BindableObserver } from "./BindableObserver";

/**
 * Event emitted whenever a BindableObserver is bound to another
 * BindableObserver using bind(), or when a bound observer's RelayFlags are
 * changed.
 */
export class ObserverBoundEvent extends Event {
	/**
	 * @inheritdoc this.bindingObserver
	 */
	private _bindingObserver: BindableObserver;

	/**
	 * @inheritdoc this.boundedObserver
	 */
	private _boundedObserver: BindableObserver;

	public constructor(bindingObserver: BindableObserver, boundedObserver: BindableObserver) {
		super();

		this._bindingObserver = bindingObserver;
		this._boundedObserver = boundedObserver;
	}

	/**
	 * Observer whose `bind()` function is being called.
	 */
	public get bindingObserver(): BindableObserver {
		return this._bindingObserver;
	}

	/**
	 * Observer that is being bound to the `bindingObserver`.
	 */
	public get boundedObserver(): BindableObserver {
		return this._boundedObserver;
	}


	public get name(): string { return "Observer Bound"; }

	public get uniqueName(): string { return "LoganGerber-BindableObserver-ObserverBoundEvent"; }
}
