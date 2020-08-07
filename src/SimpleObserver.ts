import { EventEmitter } from "events";

import { Guid } from "guid-typescript";

import { Event } from "./Event";
import { EventInvokedEvent } from "./EventInvokedEvent";

// TODO: Documentation

type Listener = (x: Event) => void;
type EventType<T extends Event> = Event | (new (...args: any) => T);
type RelayEntry = {
    relay: SimpleObserver,
    fromBubbleFunction: (event: Event) => void,
    toBubbleFunction: (event: Event) => void,
};

export enum RelayFlags {
    None = 0,
    To = 1 << 0,
    From = 1 << 1,
    All = ~(~0 << 2)
}

export class SimpleObserver {
    private internalEmitter: EventEmitter = new EventEmitter();
    private relays: Array<RelayEntry> = [];
    private idCache: Guid[] = [];
    private idCacheLimit: number = 100;


    // Manage internal guid cache
    getIdCacheLimit(): number {
        return this.idCacheLimit;
    }

    setIdCacheLimit(limit: number): void {
        if (limit <= 0) {
            this.idCacheLimit = 0;
            return;
        }

        this.idCacheLimit = limit;

        let idCacheOverflow = this.idCache.length - limit;
        this.idCache.splice(0, idCacheOverflow);
    }

    getIdCacheSize(): number {
        return this.idCache.length;
    }

    clearIdCache(): void {
        this.idCache = [];
    };


    addListener<T extends Event>(event: EventType<T>, listener: Listener): this {
        let eventName = this.getRegisterableEventName(event);

        this.internalEmitter.addListener(eventName, listener);
        return this;
    }

    emit(event: Event): boolean {
        // Check if the event has been processed already.
        if (this.idCache.includes(event.id)) {
            return false;
        }

        // Remove the oldest id if the cache limit is being exceeded
        if (this.idCacheLimit > 0 && this.idCache.length === this.idCacheLimit) {
            this.idCache.shift();
        }

        // Add the event id to the id cache
        this.idCache.push(event.id);


        let ret = this.internalEmitter.emit(event.constructor.name, event);

        let invokeEvent = new EventInvokedEvent(event);

        this.internalEmitter.emit(invokeEvent.constructor.name, invokeEvent);

        return ret;
    }

    off<T extends Event>(event: EventType<T>, listener: Listener): this {
        return this.removeListener(event, listener);
    }

    on<T extends Event>(event: EventType<T>, listener: Listener): this {
        let eventName = this.getRegisterableEventName(event);
        this.internalEmitter.on(eventName, listener);

        return this;
    }

    once<T extends Event>(event: EventType<T>, listener: Listener): this {
        let eventName = this.getRegisterableEventName(event);

        this.internalEmitter.once(eventName, listener);
        return this;
    }

    prependListener<T extends Event>(event: EventType<T>, listener: Listener): this {
        let eventName = this.getRegisterableEventName(event);

        this.internalEmitter.prependListener(eventName, listener);
        return this;
    }

    prependOnceListener<T extends Event>(event: EventType<T>, listener: Listener): this {
        let eventName = this.getRegisterableEventName(event);

        this.internalEmitter.prependOnceListener(eventName, listener);
        return this;
    }

    removeAllListeners<T extends Event>(event?: EventType<T>): this {
        if (event) {
            let eventName = this.getRegisterableEventName(event);

            this.internalEmitter.removeAllListeners(eventName);
        }
        else {
            this.internalEmitter.removeAllListeners();
        }

        return this;
    }

    removeListener<T extends Event>(event: EventType<T>, listener: Listener): this {
        let eventName = this.getRegisterableEventName(event);

        this.internalEmitter.removeListener(eventName, listener);
        return this;
    }

    hasListener<T extends Event>(event: EventType<T>, listener: Listener): boolean {
        let eventName = this.getRegisterableEventName(event);
        return this.internalEmitter.listeners(eventName).includes(listener);
    }


    // ability to attach another SimpleObserver
    bind(relay: SimpleObserver, relayFlags: RelayFlags = RelayFlags.All): void {
        let found = this.relays.find(element => element.relay === relay);
        if (!found) {
            found = {
                relay: relay,
                fromBubbleFunction: undefined,
                toBubbleFunction: undefined,
            };
            this.relays.push(found);
        }


        // Binding to a relay means to bind this.emit to an EventInvokedEvent on relay.
        if (relayFlags & RelayFlags.From) {
            if (!found.fromBubbleFunction) {
                let bubble = this.generateBubbleFunction(this);
                relay.on(EventInvokedEvent, bubble);
                found.fromBubbleFunction = bubble;
            }
        }
        else if (found.fromBubbleFunction) {
            found.relay.removeListener(EventInvokedEvent, found.fromBubbleFunction);
            found.fromBubbleFunction = undefined;
        }

        if (relayFlags & RelayFlags.To) {
            if (!found.toBubbleFunction) {
                let bubble = this.generateBubbleFunction(relay);
                this.on(EventInvokedEvent, bubble);
                found.toBubbleFunction = bubble;
            }
        }
        else if (found.toBubbleFunction) {
            this.removeListener(EventInvokedEvent, found.toBubbleFunction);
            found.toBubbleFunction = undefined;
        }
    }

    checkBinding(relay: SimpleObserver): RelayFlags | undefined {
        let found = this.relays.find(e => e.relay === relay);
        if (!found) {
            return undefined;
        }

        return RelayFlags.None |
            (found.fromBubbleFunction ? RelayFlags.From : RelayFlags.None) |
            (found.toBubbleFunction ? RelayFlags.To : RelayFlags.None);
    }

    unbind(relay: SimpleObserver): void {
        let foundIndex = this.relays.findIndex(element => element.relay === relay);
        if (foundIndex === -1) {
            return;
        }

        let found = this.relays[foundIndex];
        this.relays.splice(foundIndex, 1);

        if (found.fromBubbleFunction) {
            found.relay.removeListener(EventInvokedEvent, found.fromBubbleFunction);
        }

        if (found.toBubbleFunction) {
            this.removeListener(EventInvokedEvent, found.toBubbleFunction);
        }
    }


    private generateBubbleFunction(observer: SimpleObserver): (event: Event) => void {
        return (event: EventInvokedEvent) => {
            observer.emit(event.data);
        };
    }

    private getRegisterableEventName<T extends Event>(event: EventType<T>): string {
        if (typeof event === "function") {
            return event.name;
        }

        return event.constructor.name;
    }
}
