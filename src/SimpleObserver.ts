import { EventEmitter } from "events";

import { Guid } from "guid-typescript";

import { Event } from "./Event";
import { EventInvokedEvent } from "./EventInvokedEvent";

// TODO: Documentation

type Listener = (x: Event) => void;
type EventType<T extends Event> = Event | (new (...args: any) => T);
type RelayEntry = {
    relay: SimpleObserver,
    relayFlags: RelayFlags;
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
        this.idCacheLimit = limit;

        if (limit <= 0) {
            return;
        }

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

        ret = this.internalEmitter.emit(EventInvokedEvent.constructor.name, new EventInvokedEvent(event)) || ret;

        return ret;
    }

    off<T extends Event>(event: EventType<T>, listener: Listener): this {
        let eventName = this.getRegisterableEventName(event);
        this.internalEmitter.off(eventName, listener);

        return this;
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
    bind(relay: SimpleObserver, relayFlags: RelayFlags = RelayFlags.All): boolean {
        let found = this.relays.find(element => element.relay === relay);
        if (found) {
            return false;
        }

        found = {
            relay: relay,
            relayFlags: relayFlags
        };

        // Binding to a relay means to bind this.emit to an EventInvokedEvent on relay.
        if (relayFlags & RelayFlags.From && !relay.hasListener(EventInvokedEvent, this.emit)) {
            relay.on(EventInvokedEvent, this.emit);
        }

        if (relayFlags & RelayFlags.To && !this.hasListener(EventInvokedEvent, relay.emit)) {
            this.on(EventInvokedEvent, relay.emit);
        }
    }

    unbind(relay: SimpleObserver): void {
        let foundIndex = this.relays.findIndex(element => element.relay === relay);
        if (foundIndex === -1) {
            return;
        }

        let found = this.relays[foundIndex];
        this.relays.splice(foundIndex, 1);

        if (found.relayFlags & RelayFlags.From) {
            found.relay.removeListener(EventInvokedEvent, this.emit);
        }

        if (found.relayFlags & RelayFlags.To) {
            this.removeListener(EventInvokedEvent, found.relay.emit);
        }
    }

    setRelayFlags(relay: SimpleObserver, flags: RelayFlags): void {
        let found = this.relays.find(element => element.relay === relay);
        if (!found) {
            return;
        }

        if (flags & RelayFlags.From) {
            if (!(found.relayFlags & RelayFlags.From)) {
                found.relay.on(EventInvokedEvent, this.emit);
                found.relayFlags = found.relayFlags | RelayFlags.From;
            }
        }
        else if (found.relayFlags & RelayFlags.From) {
            found.relay.removeListener(EventInvokedEvent, this.emit);
            found.relayFlags = found.relayFlags & ~RelayFlags.From;
        }

        if (flags & RelayFlags.To) {
            if (!(found.relayFlags & RelayFlags.To)) {
                this.on(EventInvokedEvent, found.relay.emit);
                found.relayFlags = found.relayFlags | RelayFlags.To;
            }
        }
        else if (found.relayFlags & RelayFlags.To) {
            this.removeListener(EventInvokedEvent, found.relay.emit);
            found.relayFlags = found.relayFlags & ~RelayFlags.To;
        }
    }


    private getRegisterableEventName<T extends Event>(event: EventType<T>): string {
        if (typeof event === "function") {
            return event.name;
        }

        return event.constructor.name;
    }
}
