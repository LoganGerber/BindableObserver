/**
 * Error thrown when using functions that use events in a BindableObserver with
 * no internal EventEmitter set.
 */
export declare class UndefinedInternalEmitterError extends Error {
    constructor();
}
