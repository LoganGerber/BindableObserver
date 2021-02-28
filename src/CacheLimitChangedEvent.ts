import { Event } from "./Event";
import { BindableObserver } from "./BindableObserver";

/**
 * Event executed when a BindableObserver's cache limit is changed.
 */
export class CacheLimitChangedEvent extends Event {
	/**
	 * @inheritdoc this.observer
	 */
	private _observer: BindableObserver;

	/**
	 * @inheritdoc this.formerLimit
	 */
	private _formerLimit: number;

	/**
	 * @inheritdoc this.newLimit
	 */
	private _newLimit: number;

	public constructor(observer: BindableObserver, formerLimit: number, newLimit: number) {
		super();

		this._observer = observer;
		this._formerLimit = formerLimit;
		this._newLimit = newLimit;
	}


	/**
	 * BindableObserver this event was emitted from.
	 */
	public get observer(): BindableObserver {
		return this._observer;
	}

	/**
	 * Former cache limit.
	 */
	public get formerLimit(): number {
		return this._formerLimit;
	}

	/**
	 * New cache limit.
	 */
	public get newLimit(): number {
		return this._newLimit;
	}


	public get name(): string { return "Cache Limit Changed"; }

	public get uniqueName(): string { return "LoganGerber-BindableObserver-CacheLimitChangedEvent"; }
}
