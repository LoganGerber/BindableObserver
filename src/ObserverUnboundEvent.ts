import { Event } from "./Event";
import { BindableObserver } from "./BindableObserver";

/**
 * Event emitte3d when a BindableObserver is unbound from another
 * BindableObserver using unbind().
 */
export class ObserverUnboundEvent extends Event {
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
	* Observer whose `unbind()` function is being called.
	*/
	public get bindingObserver(): BindableObserver {
		return this._bindingObserver;
	}

	/**
	* Observer that is being unbound from `bindingObserver`
	*/
	public get boundedObserver(): BindableObserver {
		return this._boundedObserver;
	}


	public get name(): string { return "Observer Unbound"; }

	public get uniqueName(): string { return "LoganGerber-BindableObserver-ObserverUnboundEvent"; }
}
