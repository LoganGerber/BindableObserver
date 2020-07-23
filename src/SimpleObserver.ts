import { EventEmitter } from "events";

import { Guid } from "guid-typescript";

import { IEvent } from "./IEvent";


type Listener = (x: IEvent) => void;
type Event = IEvent | string | symbol;

const sourceRelay: unique symbol = Symbol("sourceRelay");

export class SimpleObserver extends EventEmitter {
    private relays: Array<[EventEmitter, (event: string | symbol) => void, Array<[(...args: any[]) => void, string | symbol]>]> = [];
    private idCache: Guid[] = [];
    private idCacheLimit: number = 100;



    // Manage internal guid cache
    setIdCacheLimit(limit: number): void {
        this.idCacheLimit = limit;

        if (limit <= 0) {
            return;
        }

        let idCacheOverflow = this.idCache.length - limit;
        this.idCache.splice(0, idCacheOverflow);
    }

    clearIdCache(): void {
        this.idCache = [];
    };


    addListener(event: Event, listener: Listener): this {
        return this.on(event, listener);
    }

    emit(event: Event, ...args: any[]): boolean {
        // Guarantee that event is an IEvent.
        if (typeof event !== "object") {
            // If the event isn't an object, then it's a string or a symbol.
            // Check if the first argument is an event. If it is, assume this is the true event.
            if (args.length > 0 && SimpleObserver.isIEvent(args[0])) {
                event = args[0];
            }
            // Else, create an event using the args given.
            else {
                event = {
                    id: Guid.create(),
                    name: event,
                    data: args
                };
            }
        }

        // Check if the event has been processed already.
        if (this.idCache.includes(event.id)) {
            return;
        }

        // Remove the oldest id if the cache limit is being exceeded
        if (this.idCache.length === this.idCacheLimit) {
            this.idCache.shift();
        }

        // Add the event id to the id cache
        this.idCache.push(event.id);


        let ret = super.emit(event.name, event);

        // Go through each relay, emit the event on the relay
        let originRelay: EventEmitter | undefined = undefined;
        if (event.hasOwnProperty(sourceRelay)) {
            originRelay = event[sourceRelay];
        }

        for (let relayEntry of this.relays) {
            let relay = relayEntry[0];
            if (relay !== originRelay) {
                if (relay instanceof SimpleObserver) {
                    ret = relay.emit(event) || ret;
                }
                else {
                    ret = relay.emit(event.name, event) || ret;
                }
            }
        }

        return ret;
    }

    off(event: Event, listener: Listener): this {
        return this.removeListener(event, listener);
    }

    on(event: Event, listener: Listener): this {
        event = this.changeEventForSuper(event);

        return super.on(event, listener);
    }

    once(event: Event, listener: Listener): this {
        event = this.changeEventForSuper(event);

        return super.once(event, listener);
    }

    prependListener(event: Event, listener: Listener): this {
        event = this.changeEventForSuper(event);

        return super.prependListener(event, listener);
    }

    prependOnceListener(event: Event, listener: Listener): this {
        event = this.changeEventForSuper(event);

        return super.prependOnceListener(event, listener);
    }

    removeAllListeners(event?: Event): this {
        if (event) {
            event = this.changeEventForSuper(event);

            return super.removeAllListeners(event);
        }

        return super.removeAllListeners();
    }

    removeListener(event: Event, listener: Listener): this {
        event = this.changeEventForSuper(event);

        return super.removeListener(event, listener);
    }


    // ability to attach a socket or other SimpleObserver
    bind(relay: EventEmitter): void {
        if (this.relays.find((element) => { element[0] === relay; })) {
            return;
        }

        // relay.eventNames() to get all the current event names bound to relay
        let currentEvents = relay.eventNames();
        let eventBubbleFunctions: Array<[(...args: any[]) => void, string | symbol]> = [];

        // For each name in the array, call relay.on(name, bubble)
        for (let event of currentEvents) {
            let bubble = this.bubbleFunctionGenerator(relay, event);
            eventBubbleFunctions.push([bubble, event]);
            relay.on(event, bubble);
        }

        // Register a new listener on relay.on('newListener') to generate a new bubble function if necessary
        let registerBubbleListener = this.registerNewBubbleFunctionGenerator(relay);
        relay.on('newListener', registerBubbleListener);

        // Register the list of event names for the relay internally for tracking
        this.relays.push([relay, registerBubbleListener, eventBubbleFunctions]);


        // TODO: Register a new listener on relay.on('removeListener') to see if a bubble event is no longer necessary in the relay. The intention behind this is to save memory in relays where the event isn't needed and can be deleted. However, this will also come with a performance hit, which may be not worth the effort.
        // The trouble with this is that there may be multiple SimpleObservers that register bubble listeners. This means it will need to somehow differentiate between regular listeners and bubble listeners that came from a SimpleObserver (or some potential child of SimpleObserver, which may override bubbleFunctionGenerator)
    };

    unbind(relay: EventEmitter): void {
        let foundIndex = this.relays.findIndex((element) => { element[0] === relay; });
        if (foundIndex === -1) {
            return;
        }

        let relayInfo = this.relays[foundIndex];

        this.relays.splice(foundIndex, 1);

        relay.removeListener('newListener', relayInfo[1]);

        for (let eventInfo of relayInfo[2]) {
            relay.removeListener(eventInfo[1], eventInfo[0]);
        }
    }


    private changeEventForSuper(event: Event): string | symbol {
        if (typeof event === "object") {
            event = event.name;
        }

        return event;
    }

    private bubbleFunctionGenerator(relay: EventEmitter, event: string | symbol): (...args: any[]) => void {
        return (...args: any[]): void => {
            let wrappedEvent: IEvent;

            // TODO: It's possible the event was created from something that wasn't a SimpleObserver. In this case, if the first argument is an IEvent, it's possible the event was actually the data to the actual event that occured.

            // This isn't fixed by simply checking if the event name and the IEvent.name are equal, because it could be an event nested within the same kind of event.

            // This issue is caused by an inherent loss of information when passing a string or symbol as the event, rather than the IEvent itself.
            if (args.length > 0 && SimpleObserver.isIEvent(args[0])) {
                wrappedEvent = args[0];
            }
            else {
                wrappedEvent = {
                    id: Guid.create(),
                    name: event,
                    data: args
                };
            }

            wrappedEvent[sourceRelay] = relay;

            this.emit(wrappedEvent);
        };
    }

    private registerNewBubbleFunctionGenerator(relay: EventEmitter): (event: string | symbol) => void {
        return (event: string | symbol): void => {
            let foundIndex = this.relays.findIndex(element => element[0] === relay);
            if (foundIndex === -1) {
                return;
            }

            let hasEvent = this.relays[foundIndex][2].find(element => element[1] === event);
            if (!hasEvent) {
                let bubble = this.bubbleFunctionGenerator(relay, event);
                this.relays[foundIndex][2].push([bubble, event]);
                relay.on(event, bubble);
            }
        };
    }

    private static isIEvent(obj: any): obj is IEvent {
        return 'id' in obj && Guid.isGuid(obj.id) &&
            'name' in obj && (typeof obj.name === 'string' || typeof obj.name === 'symbol') &&
            'data' in obj;
    }
}
