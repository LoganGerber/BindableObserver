/**
 * Error thrown when using functions that use events in a BindableObserver with
 * no internal EventEmitter set.
 */
export class UndefinedEmitterError extends Error {
    constructor() {
        super("Cannot call any event-using function on a BindableObserver with no InternalEmitter. Ensure an internal EventEmitter is set with BindableObserver.prototype.setInternalEmitter()");

        Object.setPrototypeOf(this, UndefinedEmitterError.prototype);
    }
}
