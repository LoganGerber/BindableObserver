import { Event } from "./Event";
import { BindableObserver } from "./BindableObserver";

/**
 * Event emitted whenever a BindableObserver is bound to another
 * BindableObserver using bind(), or when a bound observer's RelayFlags are
 * changed.
 */
export class ObserverBoundEvent extends Event {
	/**
	 * Observer whose `bind()` function is being called.
	 */
	public bindingObserver: BindableObserver;

	/**
	 * Observer that is being bound to the `bindingObserver`.
	 */
	public boundedObserver: BindableObserver;

	constructor(bindingObserver: BindableObserver, boundedObserver: BindableObserver) {
		super();

		this.bindingObserver = bindingObserver;
		this.boundedObserver = boundedObserver;
	}

	get name(): string { return "Observer Bound"; }

	get uniqueName(): string { return "LoganGerber-BindableObserver-ObserverBoundEvent"; }
}
