import { Event } from "./Event";
/**
 * Error thrown when an event is registered that does not have a unique name in
 * its uniqueName property
 */
export declare class NonUniqueNameRegisteredError extends Error {
    constructor(name: string, registeredEvent: new <T extends Event>(...args: any[]) => T, duplicateEvent: new <T extends Event>(...args: any[]) => T);
}
