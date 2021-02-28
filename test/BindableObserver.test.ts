import { EventEmitter } from "events";

import * as tap from "tap";

import { BindableObserver, Event, EmitEvent, UndefinedEmitterError, CacheLimitChangedEvent, EmitterChangedEvent, ListenerBoundEvent, ListenerRemovedEvent, ObserverBoundEvent, ObserverUnboundEvent, NonUniqueNameRegisteredError } from "../lib/BindableObserver";

class TestEvent1 extends Event {
	get name() { return "TestEvent1"; } get uniqueName() { return "LoganGerber-BindableObserverTest-TestEvent1"; }
}
class TestEvent2 extends Event {
	get name() { return "TestEvent2"; } get uniqueName() { return "LoganGerber-BindableObserverTest-TestEvent2"; }
}
class TestEvent3 extends Event {
	get name() { return "TestEvent3"; } get uniqueName() { return "LoganGerber-BindableObserverTest-TestEvent3"; }
}
class TestEvent4 extends Event {
	get name() { return "TestEvent4"; } get uniqueName() { return "LoganGerber-BindableObserverTest-TestEvent4"; }
}
class NonUniqueEvent extends Event {
	get name() {
		return "NonUniqueEvent";
	}

	get uniqueName(): string {
		return "LoganGerber-BindableObserverTest-TestEvent1";
	}
}

class TestEmitter extends EventEmitter {
	constructor(cb: () => void) {
		super();
		cb();
	}
}

// NOTE: There is no test for checking if emit() correctly emits an Event.

// BindableObserver functions
tap.test("constructing with different underlying emitters works", t => {
	let created = false;
	new BindableObserver(TestEmitter, () => created = true);

	t.equal(created, true);
	t.end();
});

tap.test("constructing with a premade EventEmitter works", t => {
	let premade = new EventEmitter();
	let obs = new BindableObserver(premade);
	let event = new TestEvent1();
	let hit1 = false;
	let hit2 = false;
	let hit3 = false;

	premade.on("TestEvent2", () => hit1 = true);
	premade.on("TestEvent3", () => hit3 = true);
	obs.on(event, () => hit2 = true);
	obs.emit(event);
	obs.emit(new TestEvent3());
	premade.emit("TestEvent2");

	t.equal(hit1, true, "Old event bindings still work when an EventEmitter is applied to a BindableObserver");
	t.equal(hit2, true, "Able to bind a new event to an observer with a premade EventEmitter");
	t.equal(hit3, false, "Event bound to EventEmitter is not affected when emitting from BindableObserver");
	t.end();
});

tap.test("constructing with no eventEmitter parameter works", t => {
	let obs = new BindableObserver();
	let event = new TestEvent1();
	let errorInstance = new UndefinedEmitterError();

	t.throws(() => obs.addListener(event, () => {}), errorInstance, "addListener() throws for incomplete BindableObserver");
	t.throws(() => obs.emit(event), errorInstance, "emit() throws for incomplete BindableObserver");
	t.throws(() => obs.off(event, () => {}), errorInstance, "off() throws for incomplete BindableObserver");
	t.throws(() => obs.on(event, () => {}), errorInstance, "on() throws for incomplete BindableObserver");
	t.throws(() => obs.once(event, () => {}), errorInstance, "once() throws for incomplete BindableObserver");
	t.throws(() => obs.prependListener(event, () => {}), errorInstance, "prependListener() throws for incomplete BindableObserver");
	t.throws(() => obs.prependOnceListener(event, () => {}), errorInstance, "prependOnceListener() throws for incomplete BindableObserver");
	t.throws(() => obs.removeAllListeners(), errorInstance, "removeAllListeners() throws for incomplete BindableObserver");
	t.throws(() => obs.removeListener(event, () => {}), errorInstance, "removeListener() throws for incomplete BindableObserver");
	t.throws(() => obs.hasListener(event, () => {}), errorInstance, "hasListener() throws for incomplete BindableObserver");
	t.end();
});

tap.test("cacheLimit sets the maximum guid cache size", t => {
	let obs = new BindableObserver(EventEmitter);
	let event1 = new TestEvent1();
	let event2 = new TestEvent1();
	let event3 = new TestEvent1();

	obs.cacheLimit = 10;

	t.equal(obs.cacheLimit, 10, "change cache limit from default");

	obs.cacheLimit = 2;

	t.equal(obs.cacheLimit, 2, "shrink cache limit");

	obs.cacheLimit = 0;

	t.equal(obs.cacheLimit, 0, "set cache limit to zero (unlimited)");

	obs.cacheLimit = 1;

	t.equal(obs.cacheLimit, 1, "change cache limit from unlimited");

	obs.cacheLimit = 35;

	t.equal(obs.cacheLimit, 35, "expand cache limit");

	obs.cacheLimit = 35;

	t.equal(obs.cacheLimit, 35, "no change to cache limit");

	obs.cacheLimit = -48;
	t.equal(obs.cacheLimit, 0, "change cache limit to negative value");

	obs.cacheLimit = 2;
	obs.emit(event1);
	obs.emit(event2);
	obs.emit(event3);
	t.equal(obs.cacheSize, 2, "cache limited");

	t.end();
});

tap.test("cacheSize gets the current number of stored items in cache", t => {
	let obs = new BindableObserver(EventEmitter);

	t.equal(obs.cacheSize, 0, "cacheSize starts with 0 length");

	obs.emit(new TestEvent1());
	obs.emit(new TestEvent1());

	t.equal(obs.cacheSize, 2, "cacheSize increased by 2 after emitting twice");
	t.end();
});

tap.test("clearCache() clears guid cache", t => {
	let obs = new BindableObserver(EventEmitter);
	obs.emitCacheLimitChangeEvents = false;
	obs.emitListenerBoundEvents = false;
	let event = new TestEvent1();
	let executionCount = 0;

	obs.cacheLimit = 5;
	obs.on(TestEvent1, () => executionCount++);

	t.equal(obs.cacheSize, 0, "no guids in cache before emitting event");

	obs.emit(event);
	obs.clearCache();

	t.equal(obs.cacheSize, 0, "cache cleared");

	obs.emit(event);

	t.equal(executionCount, 2, "event executed successfully after clear");

	t.end();
});

tap.test("setEmitter() changes the emitter the BindableObserver uses", t => {
	let obs = new BindableObserver();
	let emitter1 = new EventEmitter();
	let emitter2 = new EventEmitter();
	let event = new TestEvent1();

	obs.setEmitter(emitter1);

	t.equal(obs.getEmitter() === emitter1, true, "Internal emitter equals what it was set to");
	t.doesNotThrow(() => obs.addListener(event, () => {}), "addListener() throws for incomplete BindableObserver");
	t.doesNotThrow(() => obs.emit(event), "emit() throws for incomplete BindableObserver");
	t.doesNotThrow(() => obs.off(event, () => {}), "off() throws for incomplete BindableObserver");
	t.doesNotThrow(() => obs.on(event, () => {}), "on() throws for incomplete BindableObserver");
	t.doesNotThrow(() => obs.once(event, () => {}), "once() throws for incomplete BindableObserver");
	t.doesNotThrow(() => obs.prependListener(event, () => {}), "prependListener() throws for incomplete BindableObserver");
	t.doesNotThrow(() => obs.prependOnceListener(event, () => {}), "prependOnceListener() throws for incomplete BindableObserver");
	t.doesNotThrow(() => obs.removeAllListeners(), "removeAllListeners() throws for incomplete BindableObserver");
	t.doesNotThrow(() => obs.removeListener(event, () => {}), "removeListener() throws for incomplete BindableObserver");
	t.doesNotThrow(() => obs.hasListener(event, () => {}), "hasListener() throws for incomplete BindableObserver");

	obs.setEmitter(emitter2);

	t.equal(obs.getEmitter() === emitter1, false, "Internal emitter no longer equals the old emitter");
	t.equal(obs.getEmitter() === emitter2, true, "Internal emitter now equals the new emitter.");
	t.end();
});

tap.test("addListener() binds a function to an event", t => {
	let obs = new BindableObserver(EventEmitter);
	let evoked1Count = 0;
	let evoked2Count = 0;
	let event1 = new TestEvent2();
	let event2 = new TestEvent2();

	obs.addListener(TestEvent1, () => evoked1Count++);
	obs.addListener(event1, () => evoked2Count++);
	obs.emit(new TestEvent1());
	obs.emit(new TestEvent1());
	obs.emit(event1);
	obs.emit(event2);

	t.equal(evoked1Count, 2, "addListener() event class bound");
	t.equal(evoked2Count, 2, "addListener() event instance bound");
	t.end();
});

tap.test("off() unbinds a function from an event", t => {
	let obs = new BindableObserver(EventEmitter);
	let evoked1Count = 0;
	let evoked2Count = 0;
	let evoked3Count = 0;
	let evoked4Count = 0;

	let event2 = new TestEvent2();
	let event3 = new TestEvent3();
	let event4 = new TestEvent4();

	let inc1 = () => evoked1Count++;
	let inc2 = () => evoked2Count++;
	let inc3 = () => evoked3Count++;
	let inc4 = () => evoked4Count++;

	obs.on(TestEvent1, inc1);
	obs.on(event2, inc2);
	obs.on(TestEvent3, inc3);
	obs.on(event4, inc4);

	obs.off(TestEvent1, inc1);
	obs.off(event2, inc2);
	obs.off(event3, inc3);
	obs.off(TestEvent4, inc4);

	obs.emit(new TestEvent1());
	obs.emit(event2);
	obs.emit(event3);
	obs.emit(event4);

	t.equal(evoked1Count, 0, "off() unbind class-class");
	t.equal(evoked2Count, 0, "off() unbind instance-instance");
	t.equal(evoked3Count, 0, "off() unbind class-instance");
	t.equal(evoked4Count, 0, "off() unbind instance-class");

	t.end();
});

tap.test("on() binds a function to an event", t => {
	let obs = new BindableObserver(EventEmitter);
	let evoked1Count = 0;
	let evoked2Count = 0;
	let event1 = new TestEvent2();
	let event2 = new TestEvent2();

	obs.on(TestEvent1, () => evoked1Count++);
	obs.on(event1, () => evoked2Count++);
	obs.emit(new TestEvent1());
	obs.emit(new TestEvent1());
	obs.emit(event1);
	obs.emit(event2);

	t.equal(evoked1Count, 2, "on() event class bound");
	t.equal(evoked2Count, 2, "on() event instance bound");
	t.end();
});

tap.test("once() binds a function to an event", t => {
	let obs = new BindableObserver(EventEmitter);
	let evoked1Count = 0;
	let evoked2Count = 0;
	let event1 = new TestEvent2();
	let event2 = new TestEvent2();

	obs.once(TestEvent1, () => evoked1Count++);
	obs.once(event2, () => evoked2Count++);
	obs.emit(new TestEvent1());
	obs.emit(new TestEvent1());
	obs.emit(event1);
	obs.emit(event2);

	t.equal(evoked1Count, 1, "once() event class bound");
	t.equal(evoked2Count, 1, "once() event instance bound");
	t.end();
});

tap.test("prependListener() binds a function to an event", t => {
	let obs = new BindableObserver(EventEmitter);
	let blocker = false;
	let evoked = false;
	let event = new TestEvent1();

	obs.on(TestEvent1, () => {
		if (!blocker) {
			evoked = true;
		}
	});
	obs.prependListener(TestEvent1, () => blocker = true);
	obs.emit(event);

	t.equal(blocker, true, "second function called.");
	t.equal(evoked, false, "first function blocked.");
	t.end();
});

tap.test("prependOnceListener() binds a function to an event.", t => {
	let obs = new BindableObserver(EventEmitter);
	let blocker = false;
	let evoked1Count = 0;
	let evoked2Count = 0;
	let event1 = new TestEvent1();
	let event2 = new TestEvent1();

	obs.on(TestEvent1, () => {
		if (!blocker) {
			evoked1Count++;
		}
	});
	obs.prependOnceListener(TestEvent1, () => {
		blocker = true;
		evoked2Count++;
	});
	obs.emit(event1);
	obs.emit(event2);

	t.equal(blocker, true, "blocker set in prepend");
	t.equal(evoked1Count, 0, "first event blocked");
	t.equal(evoked2Count, 1, "prepended listener called once");
	t.end();
});

tap.test("removeAllListeners() unbinds all functions from events", t => {
	let obs = new BindableObserver(EventEmitter);
	obs.registerEvent(TestEvent4, true);
	let event11 = new TestEvent1();
	let event12 = new TestEvent1();
	let event21 = new TestEvent2();
	let event22 = new TestEvent2();
	let event31 = new TestEvent3();
	let event41 = new TestEvent4();
	let event42 = new TestEvent4();
	let ev1Count = 0;
	let ev2Count = 0;
	let ev3Count = 0;
	let ev4Count = 0;

	obs.on(TestEvent1, () => ev1Count++);
	obs.on(TestEvent1, () => ev1Count++);
	obs.on(TestEvent2, () => ev2Count++);
	obs.on(TestEvent2, () => ev2Count++);
	obs.on(TestEvent3, () => ev3Count++);
	obs.on(TestEvent3, () => ev3Count++);
	obs.on(TestEvent4, () => ev4Count++);
	obs.removeAllListeners(TestEvent1);
	obs.emit(event11);
	obs.emit(event12);
	obs.emit(event21);
	obs.emit(event41);

	t.equal(ev1Count, 0, "removed all listeners from an event");
	t.equal(ev2Count, 2, "kept unaffected events and listeners");
	t.equal(ev4Count, 1, "kept unaffected unique events and listeners");

	obs.removeAllListeners();
	obs.emit(event22);
	obs.emit(event31);
	obs.emit(event42);

	t.equal(ev2Count, 2, "removed testevent2 when removing all listeners");
	t.equal(ev3Count, 0, "removed testevent3 when removing all listeners");
	t.equal(ev4Count, 1, "removed testevent4 (unique) when removing all listeners");

	t.end();
});

tap.test("removeAllListeners() does not remove listeners bound using the emitter instance", t => {
	let emitter = new EventEmitter();
	let obs = new BindableObserver(emitter);
	let count = 0;

	emitter.on("myEvent", () => count++);
	obs.removeAllListeners();
	emitter.emit("myEvent");

	t.equal(count, 1, "removeAllListeners() did not remove emitter's listeners");
	t.end();
});

tap.test("removeAllListeners(event) does not crash when an unbound event's listeners", t => {
	let obs = new BindableObserver(EventEmitter);

	t.doesNotThrow(() => { obs.removeAllListeners(TestEvent1); }, "Removed listeners from an unbound event.");
	t.end();
});

tap.test("removeAllListeners(EmitEvent) does not remove listeners needed for binding observers", t => {
	let obs1 = new BindableObserver(EventEmitter);
	let obs2 = new BindableObserver(EventEmitter);
	let called1 = false;
	let called2 = false;

	obs1.emitListenerBoundEvents = false;
	obs1.emitListenerRemovedEvents = false;
	obs1.emitObserverBoundEvents = false;
	obs1.emitObserverUnboundEvents = false;
	obs1.emitEmitEvents = true;
	obs2.emitListenerBoundEvents = false;
	obs2.emitListenerRemovedEvents = false;
	obs2.emitObserverBoundEvents = false;
	obs2.emitObserverUnboundEvents = false;
	obs2.emitEmitEvents = true;

	obs1.on(EmitEvent, () => called1 = true);
	obs2.on(EmitEvent, () => called2 = true);
	obs1.bind(obs2);
	called1 = false;
	called2 = false;
	obs1.removeAllListeners(EmitEvent);

	obs1.emit(new TestEvent1());

	t.equal(called1, false, "EmitEvent bind for obs1 was successfully removed");
	t.equal(called2, true, "Listener made for binding successfully kept");
	t.end();
});

tap.test("removeListener() unbinds a function from an event", t => {
	let obs = new BindableObserver(EventEmitter);
	let evoked1Count = 0;
	let evoked2Count = 0;
	let evoked3Count = 0;
	let evoked4Count = 0;

	let event2 = new TestEvent2();
	let event3 = new TestEvent3();
	let event4 = new TestEvent4();

	let inc1 = () => evoked1Count++;
	let inc2 = () => evoked2Count++;
	let inc3 = () => evoked3Count++;
	let inc4 = () => evoked4Count++;

	obs.on(TestEvent1, inc1);
	obs.on(event2, inc2);
	obs.on(TestEvent3, inc3);
	obs.on(event4, inc4);

	obs.removeListener(TestEvent1, inc1);
	obs.removeListener(event2, inc2);
	obs.removeListener(event3, inc3);
	obs.removeListener(TestEvent4, inc4);

	obs.emit(new TestEvent1());
	obs.emit(event2);
	obs.emit(event3);
	obs.emit(event4);

	t.equal(evoked1Count, 0, "removeListener() unbind class-class");
	t.equal(evoked2Count, 0, "removeListener() unbind instance-instance");
	t.equal(evoked3Count, 0, "removeListener() unbind class-instance");
	t.equal(evoked4Count, 0, "removeListener() unbind instance-class");

	t.end();
});

tap.test("hasListener() checks if a listener is bound to an event", t => {
	let obs = new BindableObserver(EventEmitter);
	obs.throwOnNonUniqueEventName = false;
	obs.registerEvent(TestEvent2);
	let f1 = () => {};
	let f2 = () => {};
	let event = new TestEvent1();

	obs.on(TestEvent1, f1);

	t.equal(obs.hasListener(TestEvent1, f1), true, "found listener with class");
	t.equal(obs.hasListener(event, f1), true, "found listener with instance");
	t.equal(obs.hasListener(TestEvent1, f2), false, "did not find listener");
	t.equal(obs.hasListener(NonUniqueEvent, f1), false, "did not find unbound listener with non-unique name");

	t.end();
});

tap.test("bind() binds a relay and adds it to the list of bound relays", t => {
	let obs1 = new BindableObserver(EventEmitter);
	let obs2 = new BindableObserver(EventEmitter);
	let called = false;

	obs2.on(TestEvent1, () => called = true);
	obs1.bind(obs2);
	obs1.emit(new TestEvent1());

	t.equal(obs1.checkBinding(obs2), true, "obs2 bound to obs1");
	t.equal(called, true, "Event relay successful");
	t.end();
});

tap.test("bind() only binds a relay at most once", t => {
	let obs1 = new BindableObserver(EventEmitter);
	let obs2 = new BindableObserver(EventEmitter);
	let count = 0;

	obs2.on(TestEvent1, () => count++);
	obs1.bind(obs2);
	obs1.bind(obs2);
	obs1.emit(new TestEvent1());

	t.equal(count, 1, "BindableObserver only bound once.");
	t.end();
});

tap.test("unbind() unbinds observers", t => {
	let obs1 = new BindableObserver(EventEmitter);
	let obs2 = new BindableObserver(EventEmitter);
	let event = new TestEvent1();
	let evoked = false;
	let setEvokeFunction1: () => void = () => evoked = true;

	obs1.on(event, setEvokeFunction1);
	obs2.bind(obs1);
	obs2.unbind(obs1);
	obs2.emit(event);

	t.equal(evoked, false, "unbinding successful");
	t.doesNotThrow(() => obs1.unbind(obs2), "unbind does not throw an error when unbinding two non-bound observers");
	t.end();
});


// cache functionality
tap.test("cache prevents repeated event handling", t => {
	let obs = new BindableObserver(EventEmitter);
	obs.emitCacheLimitChangeEvents = false;
	obs.emitListenerBoundEvents = false;
	let evokeCount = 0;
	let event1 = new TestEvent1();
	let event2 = new TestEvent1();

	obs.cacheLimit = 5;
	obs.on(TestEvent1, () => evokeCount++);
	obs.emit(event1);
	obs.emit(event1);

	t.equal(evokeCount, 1, "event stopped by cache");
	t.equal(obs.cacheSize, 1, "cache only stored one event");

	obs.emit(event2);

	t.equal(evokeCount, 2, "event not stopped by cache");
	t.equal(obs.cacheSize, 2, "cache stored second event");
	t.end();
});

tap.test("cache limit removes oldest cached items", t => {
	let obs = new BindableObserver(EventEmitter);
	let event1 = new TestEvent1();
	let event2 = new TestEvent1();
	let event3 = new TestEvent1();
	let evokeCount = 0;

	obs.cacheLimit = 2;
	obs.on(TestEvent1, () => evokeCount++);
	obs.emit(event1);
	obs.emit(event2);
	obs.emit(event3);
	obs.emit(event1);

	t.equal(evokeCount, 4, "old cache removed");
	t.equal(obs.cacheSize, 2, "cache length matches limit");
	t.end();
});


// BindableObserver meta-event functionality
tap.test("emitCacheLimitChangeEvents setter properly changes property", t => {
	let obs = new BindableObserver(EventEmitter);
	obs.emitCacheLimitChangeEvents = true;

	t.equal(obs.emitCacheLimitChangeEvents, true, "emitCacheLimitChangeEvents successfully set to true");

	obs.emitCacheLimitChangeEvents = false;

	t.equal(obs.emitCacheLimitChangeEvents, false, "emitCacheLimitChangeEvents successfully set to false");

	obs.emitCacheLimitChangeEvents = true;

	t.equal(obs.emitCacheLimitChangeEvents, true, "emitCacheLimitChangeEvents successfully reset to true");
	t.end();
});

tap.test("cacheLimit setter emits a CacheLimitChangeEvent on successful limit change", t => {
	let obs = new BindableObserver(EventEmitter);
	obs.emitCacheLimitChangeEvents = true;

	let count = 0;
	let formerLimit = obs.cacheLimit;
	let obtainedPrevious: number | undefined = undefined;
	let obtainedNew: number | undefined = undefined;
	let obtainedObs: BindableObserver | undefined = undefined;

	obs.emitCacheLimitChangeEvents = true;
	obs.on(CacheLimitChangedEvent, e => {
		obtainedPrevious = e.formerLimit;
		obtainedNew = e.newLimit;
		obtainedObs = e.observer;

		count++;
	});
	obs.cacheLimit = 25;

	t.equal(count, 1, "CacheLimitChangedEvent was emitted after changing cache limit");
	t.equal(obtainedPrevious, formerLimit, "CacheLimitChangedEvent.formerLimit successfully set");
	t.equal(obtainedNew, 25, "CacheLimitChangedEvent.newLimit successfully set");
	t.equal(obtainedObs, obs, "CacheLimitChangedEvent.observer successfully set");

	obs.cacheLimit = 25;

	t.equal(count, 1, "CacheLimitChangedEvent not emitted after setting to the current limit");

	obs.emitCacheLimitChangeEvents = false;
	formerLimit = obs.cacheLimit;
	obs.cacheLimit = 30;

	t.equal(count, 1, "CacheLimitChangedEvent was not emitted after disabling");

	t.end();
});

tap.test("emitEmitterChangedEvents setter properly changes property", t => {
	let obs = new BindableObserver(EventEmitter);
	obs.emitEmitterChangedEvents = true;

	t.equal(obs.emitEmitterChangedEvents, true, "emitEmitterChangedEvents successfully set to true");

	obs.emitEmitterChangedEvents = false;

	t.equal(obs.emitEmitterChangedEvents, false, "emitEmitterChangedEvents successfully set to false");

	obs.emitEmitterChangedEvents = true;

	t.equal(obs.emitEmitterChangedEvents, true, "emitEmitterChangedEvents successfully reset to true");
	t.end();
});

tap.test("setEmitter() emits an EmitterChangedEvent on successful change", t => {
	let emitter1 = new EventEmitter();
	let emitter2 = new EventEmitter();
	let obs = new BindableObserver(emitter1);
	let formerEmitter: EventEmitter | undefined = undefined;
	let newEmitter: EventEmitter | undefined = undefined;
	let observer: BindableObserver | undefined = undefined;
	let emitCount = 0;

	obs.emitEmitterChangedEvents = true;
	obs.on(EmitterChangedEvent, e => {
		formerEmitter = e.formerEmitter;
		newEmitter = e.newEmitter;
		observer = e.observer;
		emitCount++;
	});
	obs.setEmitter(emitter2);

	t.equal(emitCount, 1, "EmitterChangedEvent emitted after changing the emitter");
	t.equal(formerEmitter, emitter1, "EmitterChangedEvent.formerEmitter successfully set");
	t.equal(newEmitter, emitter2, "EmitterChangedEvent.newEmitter successfully set");
	t.equal(observer, obs, "EmitterChangedEvent.observer successfully set");

	obs.setEmitter(emitter2);

	t.equal(emitCount, 1, "EmitterchangedEvent not emitted after setting the emitter to the current emitter");

	obs.emitEmitterChangedEvents = false;
	obs.setEmitter(emitter1);

	t.equal(emitCount, 1, "EmitterChangedEvent was not emitted after disabling");

	t.end();
});

tap.test("emitEmitEvents setter properly changes property", t => {
	let obs = new BindableObserver(EventEmitter);
	obs.emitEmitEvents = true;

	t.equal(obs.emitEmitEvents, true, "emitEmitEvents successfully set to true");

	obs.emitEmitEvents = false;

	t.equal(obs.emitEmitEvents, false, "emitEmitEvents successfully set to false");

	obs.emitEmitEvents = true;

	t.equal(obs.emitEmitEvents, true, "emitEmitEvents successfully reset to true");
	t.end();
});

tap.test("emit() emits an EmitEvent on successful emit", t => {
	let obs = new BindableObserver(EventEmitter);
	obs.emitListenerBoundEvents = false;
	let event1 = new TestEvent1();
	let event2 = new TestEvent1();
	let executionCount = 0;
	let foundEvent: Event | undefined = undefined;

	obs.emitEmitEvents = true;
	obs.on(EmitEvent, e => {
		foundEvent = e.emitted;
		executionCount++;
	});
	obs.emit(event1);

	t.equal(executionCount, 1, "EmitEvent emitted after emit");
	t.equal(foundEvent, event1, "EmitEvent.emitted successfully set");

	obs.emit(event1);

	t.equal(executionCount, 1, "EmitEvent not emitted after sending duplicate event");

	obs.emitEmitEvents = false;
	obs.emit(event2);

	t.equal(executionCount, 1, "EmitEvent not emitted after being disabled");
	t.end();
});

tap.test("emitListenerBoundEvents setter properly changes property", t => {
	let obs = new BindableObserver(EventEmitter);
	obs.emitListenerBoundEvents = true;

	t.equal(obs.emitListenerBoundEvents, true, "emitListenerBoundEvents successfully set to true");

	obs.emitListenerBoundEvents = false;

	t.equal(obs.emitListenerBoundEvents, false, "emitListenerBoundEvents successfully set to false");

	obs.emitListenerBoundEvents = true;

	t.equal(obs.emitListenerBoundEvents, true, "emitListenerBoundEvents successfully reset to true");
	t.end();
});

tap.test("addListener() emits a ListenerBoundEvent on binding a new listener", t => {
	let obs = new BindableObserver(EventEmitter);
	let l1 = function (event: Event) { event; };
	let l2 = function (event: Event) { event; };

	let count = 0;
	let observer: BindableObserver | undefined = undefined;
	let listener: ((event: Event) => void) | undefined = undefined;
	let event: (new (...args: any[]) => Event) | undefined = undefined;
	let once: boolean | undefined = undefined;

	obs.emitListenerBoundEvents = true;
	obs.on(ListenerBoundEvent, e => {
		observer = e.observer;
		listener = e.listener;
		event = e.event;
		once = e.once;
		count++;
	});
	count = 0;
	obs.addListener(TestEvent1, l1);

	t.equal(count, 1, "ListnerBoundEvent emitted successfully for addListener");
	t.equal(observer, obs, "ListenerBoundEvent.observer successfully set for addListener");
	t.equal(listener, l1, "ListenerBoundEvent.listener successfully set for addListener");
	t.equal(event, TestEvent1, "ListenerBoundEvent.event successfully set for addListener");
	t.equal(once, false, "ListenerBoundEvent.once successfully set for addListener");

	obs.emitListenerBoundEvents = false;
	obs.addListener(TestEvent2, l2);

	t.equal(count, 1, "ListenerBoundEvent did not emit after being disabled for addListener");
	t.end();
});

tap.test("on() emits a ListenerBoundEvent on binding a new listener", t => {
	let obs = new BindableObserver(EventEmitter);
	let l1 = function (event: Event) { event; };
	let l2 = function (event: Event) { event; };

	let count = 0;
	let observer: BindableObserver | undefined = undefined;
	let listener: ((event: Event) => void) | undefined = undefined;
	let event: (new (...args: any[]) => Event) | undefined = undefined;
	let once: boolean | undefined = undefined;

	obs.emitListenerBoundEvents = true;
	obs.on(ListenerBoundEvent, e => {
		observer = e.observer;
		listener = e.listener;
		event = e.event;
		once = e.once;
		count++;
	});
	count = 0;
	obs.on(TestEvent1, l1);

	t.equal(count, 1, "ListnerBoundEvent emitted successfully for on");
	t.equal(observer, obs, "ListenerBoundEvent.observer successfully set for on");
	t.equal(listener, l1, "ListenerBoundEvent.listener successfully set for on");
	t.equal(event, TestEvent1, "ListenerBoundEvent.event successfully set for on");
	t.equal(once, false, "ListenerBoundEvent.once successfully set for on");

	obs.emitListenerBoundEvents = false;
	obs.on(TestEvent2, l2);

	t.equal(count, 1, "ListenerBoundEvent did not emit after being disabled for on");
	t.end();
});

tap.test("once() emits a ListenerBoundEvent on binding a new listener", t => {
	let obs = new BindableObserver(EventEmitter);
	let l1 = function (event: Event) { event; };
	let l2 = function (event: Event) { event; };
	let l3 = function (event: Event) { event; };

	let count = 0;
	let observer: BindableObserver | undefined = undefined;
	let listener: ((event: Event) => void) | undefined = undefined;
	let event: (new (...args: any[]) => Event) | undefined = undefined;
	let once: boolean | undefined = undefined;

	obs.emitListenerBoundEvents = true;
	obs.on(ListenerBoundEvent, e => {
		observer = e.observer;
		listener = e.listener;
		event = e.event;
		once = e.once;
		count++;
	});
	count = 0;
	obs.once(TestEvent1, l1);

	t.equal(count, 1, "ListnerBoundEvent emitted successfully for once on constructor");
	t.equal(observer, obs, "ListenerBoundEvent.observer successfully set for once on constructor");
	t.equal(listener, l1, "ListenerBoundEvent.listener successfully set for once on constructor");
	t.equal(event, TestEvent1, "ListenerBoundEvent.event successfully set for once on constructor");
	t.equal(once, true, "ListenerBoundEvent.once successfully set for once on constructor");

	obs.once(new TestEvent2, l2);

	t.equal(count, 2, "ListenerBoundEvent emitted successfully when binding on instance");
	t.equal(observer, obs, "ListenerBoundEvent.observer successfully set for once on instance");
	t.equal(listener, l2, "ListenerBoundEvent.listener successfully set for once on instance");
	t.equal(event, TestEvent2, "ListenerBoundEvent.event successfully set for once on instance");
	t.equal(once, true, "ListenerBoundEvent.once successfully set for once on instance");

	obs.emitListenerBoundEvents = false;
	obs.once(TestEvent2, l3);

	t.equal(count, 2, "ListenerBoundEvent did not emit after being disabled for once");
	t.end();
});

tap.test("prependListener() emits a ListenerBoundEvent on binding a new listener", t => {
	let obs = new BindableObserver(EventEmitter);
	let l1 = function (event: Event) { event; };
	let l2 = function (event: Event) { event; };

	let count = 0;
	let observer: BindableObserver | undefined = undefined;
	let listener: ((event: Event) => void) | undefined = undefined;
	let event: (new (...args: any[]) => Event) | undefined = undefined;
	let once: boolean | undefined = undefined;

	obs.emitListenerBoundEvents = true;
	obs.on(ListenerBoundEvent, e => {
		observer = e.observer;
		listener = e.listener;
		event = e.event;
		once = e.once;
		count++;
	});
	count = 0;
	obs.prependListener(TestEvent1, l1);

	t.equal(count, 1, "ListnerBoundEvent emitted successfully for prependListener");
	t.equal(observer, obs, "ListenerBoundEvent.observer successfully set for prependListener");
	t.equal(listener, l1, "ListenerBoundEvent.listener successfully set for prependListener");
	t.equal(event, TestEvent1, "ListenerBoundEvent.event successfully set for prependListener");
	t.equal(once, false, "ListenerBoundEvent.once successfully set for prependListener");

	obs.emitListenerBoundEvents = false;
	obs.prependListener(TestEvent2, l2);

	t.equal(count, 1, "ListenerBoundEvent did not emit after being disabled for prependListener");
	t.end();
});

tap.test("prependOnceListener() emits a ListenerBoundEvent on binding a new listener", t => {
	let obs = new BindableObserver(EventEmitter);
	let l1 = function (event: Event) { event; };
	let l2 = function (event: Event) { event; };

	let count = 0;
	let observer: BindableObserver | undefined = undefined;
	let listener: ((event: Event) => void) | undefined = undefined;
	let event: (new (...args: any[]) => Event) | undefined = undefined;
	let once: boolean | undefined = undefined;

	obs.emitListenerBoundEvents = true;
	obs.on(ListenerBoundEvent, e => {
		observer = e.observer;
		listener = e.listener;
		event = e.event;
		once = e.once;
		count++;
	});
	count = 0;
	obs.prependOnceListener(TestEvent1, l1);

	t.equal(count, 1, "ListnerBoundEvent emitted successfully for prependOnceListener");
	t.equal(observer, obs, "ListenerBoundEvent.observer successfully set for prependOnceListener");
	t.equal(listener, l1, "ListenerBoundEvent.listener successfully set for prependOnceListener");
	t.equal(event, TestEvent1, "ListenerBoundEvent.event successfully set for prependOnceListener");
	t.equal(once, true, "ListenerBoundEvent.once successfully set for prependOnceListener");

	obs.emitListenerBoundEvents = false;
	obs.prependOnceListener(TestEvent2, l2);

	t.equal(count, 1, "ListenerBoundEvent did not emit after being disabled for prependOnceListener");
	t.end();
});

tap.test("emitListenerRemovedEvents setter properly changes property", t => {
	let obs = new BindableObserver(EventEmitter);
	obs.emitListenerRemovedEvents = true;

	t.equal(obs.emitListenerRemovedEvents, true, "emitListenerRemovedEvents successfully set to true");

	obs.emitListenerRemovedEvents = false;

	t.equal(obs.emitListenerRemovedEvents, false, "emitListenerRemovedEvents successfully set to false");

	obs.emitListenerRemovedEvents = true;

	t.equal(obs.emitListenerRemovedEvents, true, "emitListenerRemovedEvents successfully reset to true");
	t.end();
});

tap.test("off() emits a ListenerRemovedEvent on successfully removing a listener", t => {
	let obs = new BindableObserver(EventEmitter);
	let l1 = function (event: Event) { event; };
	let l2 = function (event: Event) { event; };
	let l3 = function (event: Event) { event; };

	let count = 0;
	let observer: BindableObserver | undefined = undefined;
	let listener: ((event: Event) => void) | undefined = undefined;
	let event: (new (...args: any[]) => Event) | undefined = undefined;

	obs.emitListenerRemovedEvents = true;
	obs.on(ListenerRemovedEvent, e => {
		count++;
		observer = e.observer;
		listener = e.listener;
		event = e.event;
	});
	obs.on(TestEvent1, l1);
	obs.on(TestEvent2, l2);
	obs.off(TestEvent1, l1);

	t.equal(count, 1, "ListenerRemovedEvent emitted after removing an event for off");
	t.equal(observer, obs, "ListenerRemovedEvent.observer successfully set for off");
	t.equal(listener, l1, "ListenerRemovedEvent.listener successfully set for off");
	t.equal(event, TestEvent1, "ListenerRemovedEvent.event successfully set for off");

	obs.off(TestEvent3, l3);

	t.equal(count, 1, "ListenerRemovedEvent not emitted after removing a non-bound listener for off");

	obs.emitListenerRemovedEvents = false;
	obs.off(TestEvent2, l2);

	t.equal(count, 1, "ListenerRemovedEvent not emitted after being disabled for off");
	t.end();
});

tap.test("removeListener() emits a ListenerRemovedEvent on successfully removing a listener", t => {
	let obs = new BindableObserver(EventEmitter);
	let l1 = function (event: Event) { event; };
	let l2 = function (event: Event) { event; };
	let l3 = function (event: Event) { event; };

	let count = 0;
	let observer: BindableObserver | undefined = undefined;
	let listener: ((event: Event) => void) | undefined = undefined;
	let event: (new (...args: any[]) => Event) | undefined = undefined;

	obs.emitListenerRemovedEvents = true;
	obs.on(ListenerRemovedEvent, e => {
		count++;
		observer = e.observer;
		listener = e.listener;
		event = e.event;
	});
	obs.on(TestEvent1, l1);
	obs.on(TestEvent2, l2);
	obs.removeListener(TestEvent1, l1);

	t.equal(count, 1, "ListenerRemovedEvent emitted after removing an event for removeListener");
	t.equal(observer, obs, "ListenerRemovedEvent.observer successfully set for removeListener");
	t.equal(listener, l1, "ListenerRemovedEvent.listener successfully set for removeListener");
	t.equal(event, TestEvent1, "ListenerRemovedEvent.event successfully set for removeListener");

	obs.removeListener(TestEvent3, l3);

	t.equal(count, 1, "ListenerRemovedEvent not emitted after removing a non-bound listener for removeListener");

	obs.emitListenerRemovedEvents = false;
	obs.removeListener(TestEvent2, l2);

	t.equal(count, 1, "ListenerRemovedEvent not emitted after being disabled for removeListener");
	t.end();
});

tap.test("removeAllListeners(event) emits a ListenerRemovedEvent for each listener removed", t => {
	let obs = new BindableObserver(EventEmitter);
	let l1 = function (event: Event) { event; };
	let l2 = function (event: Event) { event; };
	let l3 = function (event: Event) { event; };
	let l4 = function (event: Event) { event; };
	let l5 = function (event: Event) { event; };
	let count = 0;

	obs.on(ListenerRemovedEvent, () => {
		count++;
	});
	obs.on(TestEvent1, l1);
	obs.on(TestEvent2, l2);
	obs.on(TestEvent2, l3);
	obs.on(TestEvent3, l4);
	obs.on(TestEvent3, l5);
	obs.removeAllListeners(TestEvent1);

	t.equal(count, 1, "ListenerRemovedEvent emitted once after removing all of one listener from an event");

	obs.removeAllListeners(new TestEvent2());

	t.equal(count, 3, "ListenerRemovedEvent emitted twice after removing all of two listeners from an event");

	obs.removeAllListeners(TestEvent2);

	t.equal(count, 3, "ListenerRemovedEvent not emitted after removing no listeners");

	obs.emitListenerRemovedEvents = false;
	obs.removeAllListeners(TestEvent3);

	t.equal(count, 3, "ListenerRemovedEvent not emitted after being disabled");
	t.end();
});

tap.test("removeAllListeners() emits a ListenerRemovedEvent for each listener removed", t => {
	let obs1 = new BindableObserver(EventEmitter);
	let obs2 = new BindableObserver(EventEmitter);
	let l1 = function (event: Event) { event; };
	let l2 = function (event: Event) { event; };
	let l3 = function (event: Event) { event; };
	let l4 = function (event: Event) { event; };

	let count = 0;

	obs1.emitListenerRemovedEvents = true;
	obs2.emitListenerRemovedEvents = true;
	obs1.bind(obs2);
	obs2.on(ListenerRemovedEvent, () => {
		count++;
	});
	obs1.on(TestEvent1, l1);
	obs1.on(TestEvent2, l2);
	obs1.on(TestEvent2, l3);
	obs1.removeAllListeners();

	t.equal(count, 3, "ListenerRemovedEvent emitted for all listeners after removing all listeners");

	obs1.removeAllListeners();

	t.equal(count, 3, "ListenerRemovedEvent not emitted after removing no listeners");

	obs1.on(TestEvent3, l4);
	obs1.emitListenerRemovedEvents = false;
	obs1.removeAllListeners();

	t.equal(count, 3, "ListenerRemovedEvent not emitted after being disabled");
	t.end();
});

tap.test("emitObserverBoundEvents setter properly changes property", t => {
	let obs = new BindableObserver(EventEmitter);
	obs.emitObserverBoundEvents = true;

	t.equal(obs.emitObserverBoundEvents, true, "emitObserverBoundEvents successfully set to true");

	obs.emitObserverBoundEvents = false;

	t.equal(obs.emitObserverBoundEvents, false, "emitObserverBoundEvents successfully set to false");

	obs.emitObserverBoundEvents = true;

	t.equal(obs.emitObserverBoundEvents, true, "emitObserverBoundEvents successfully reset to true");
	t.end();
});

tap.test("bind() emits an ObserverBoundEvent after successfully binding an observer", t => {
	let obs1 = new BindableObserver(EventEmitter);
	let obs2 = new BindableObserver(EventEmitter);
	let obs3 = new BindableObserver(EventEmitter);

	let count = 0;
	let bindingObserver: BindableObserver | undefined = undefined;
	let boundedObserver: BindableObserver | undefined = undefined;

	obs1.emitObserverBoundEvents = true;
	obs1.on(ObserverBoundEvent, e => {
		count++;
		bindingObserver = e.bindingObserver;
		boundedObserver = e.boundedObserver;
	});
	obs1.bind(obs2);

	t.equal(count, 1, "ObserverBoundEvent successfully emitted after binding two observers");
	t.equal(bindingObserver, obs1, "ObserverBoundEvent.bindingObserver successfully set for new bind");
	t.equal(boundedObserver, obs2, "ObserverBoundEvent.boundedObserver successfully set for new bind");

	obs1.emitObserverBoundEvents = false;
	obs1.bind(obs3);

	t.equal(count, 1, "ObserverBoundEvent not emitted after being disabled for binding a new observer");
	t.end();
});

tap.test("bind() does not emit an ObserverBoundEvent when binding two already bound observers", t => {
	let obs1 = new BindableObserver(EventEmitter);
	let obs2 = new BindableObserver(EventEmitter);
	let count = 0;

	obs1.emitObserverBoundEvents = true;
	obs1.on(ObserverBoundEvent, () => count++);
	obs1.bind(obs2);
	obs1.bind(obs2);

	t.equal(count, 1, "ObserverBoundEvent only emitted once for a single bind");
	t.end();
});

tap.test("emitObserverUnboundEvents setter properly changes property", t => {
	let obs = new BindableObserver(EventEmitter);
	obs.emitObserverUnboundEvents = true;

	t.equal(obs.emitObserverUnboundEvents, true, "emitObserverUnboundEvents successfully set to true");

	obs.emitObserverUnboundEvents = false;

	t.equal(obs.emitObserverUnboundEvents, false, "emitObserverUnboundEvents successfully set to false");

	obs.emitObserverUnboundEvents = true;

	t.equal(obs.emitObserverUnboundEvents, true, "emitObserverUnboundEvents successfully reset to true");
	t.end();
});

tap.test("unbind() emits an ObserverUnboundEvent after successfully unbinding two observers", t => {
	let obs1 = new BindableObserver(EventEmitter);
	let obs2 = new BindableObserver(EventEmitter);
	let obs3 = new BindableObserver(EventEmitter);
	let obs4 = new BindableObserver(EventEmitter);

	let count = 0;
	let bindingObserver: BindableObserver | undefined = undefined;
	let boundedObserver: BindableObserver | undefined = undefined;

	obs1.emitObserverUnboundEvents = true;
	obs1.on(ObserverUnboundEvent, e => {
		count++;
		bindingObserver = e.bindingObserver;
		boundedObserver = e.boundedObserver;
	});
	obs1.bind(obs2);
	obs1.unbind(obs2);

	t.equal(count, 1, "ObserverUnboundEvent emitted after unbinding an observer");
	t.equal(bindingObserver, obs1, "ObserverUnboundEvent.bindingObserver successfully set");
	t.equal(boundedObserver, obs2, "ObserverUnboundEvent.boundedObserver successfully set");

	obs1.unbind(obs2);

	t.equal(count, 1, "ObserverUnboundEvent not emitted after unbinding an already unbound observer");

	obs1.unbind(obs3);

	t.equal(count, 1, "ObserverUnboundEvent not emitted after unbinding an observer that was never bound");

	obs1.emitObserverUnboundEvents = false;
	obs1.bind(obs4);
	obs1.unbind(obs4);

	t.equal(count, 1, "ObserverUnboundEvent not emitted after being disabled");
	t.end();
});


// BindableObserver event registration functionality
tap.test("registerEvent() returns true if an event was registered with a unique name", t => {
	let obs = new BindableObserver(EventEmitter);
	obs.throwOnNonUniqueEventName = false;
	let newEventSet = obs.registerEvent(TestEvent1);

	t.equal(newEventSet, true, "Return true for new symbol set");

	let forcedUniqueSucceeded = obs.registerEvent(NonUniqueEvent, true);

	t.equal(forcedUniqueSucceeded, true, "Return true for forcing a non-unique symbol to be set");

	let duplicateForcedSucceeded = obs.registerEvent(NonUniqueEvent, true);

	t.equal(duplicateForcedSucceeded, true, "Return true for repeated forcing a non-unique symbol to be set");
	t.end();
});

tap.test("registerEvent() returns true when changing a non-uniquely bound event to a uniquely bound event", t => {
	let obs = new BindableObserver(EventEmitter);
	obs.throwOnNonUniqueEventName = false;
	obs.registerEvent(TestEvent1);

	t.equal(obs.registerEvent(TestEvent1, true), true, "Changing an event to uniquely-bounded returns true.");
	t.equal(obs.registerEvent(NonUniqueEvent), true, "Unbound ununiquely-bounded event");

	t.end();
});

tap.test("registerEvent() returns true when changing a uniquely bound event to a non-uniquely bound event", t => {
	let obs = new BindableObserver(EventEmitter);
	obs.throwOnNonUniqueEventName = false;
	obs.registerEvent(TestEvent1, true);

	t.equal(obs.registerEvent(TestEvent1), true, "Changing an event to non-uniquely bound returns true");
	t.equal(obs.registerEvent(NonUniqueEvent), false, "Unbound uniquely-bounded event");

	t.end();
});

tap.test("registerEvent() returns true when rebinding an event", t => {
	let obs = new BindableObserver(EventEmitter);
	let testEvent1Executed = false;
	let testEvent2Executed = false;

	obs.throwOnNonUniqueEventName = true;
	obs.registerEvent(TestEvent1);
	obs.registerEvent(TestEvent2, true);
	obs.on(TestEvent1, () => testEvent1Executed = true);
	obs.on(TestEvent2, () => testEvent2Executed = true);

	t.equal(obs.registerEvent(TestEvent1), true, "Rebinding non-unique event returned true");
	t.equal(obs.registerEvent(TestEvent2, true), true, "Rebinding unique event returned true");

	obs.emit(new TestEvent1());
	obs.emit(new TestEvent2());

	t.equal(testEvent1Executed, true, "Rebinding non-unique event kept bound listeners");
	t.equal(testEvent2Executed, true, "Rebinding unique event kept bound listeners");

	t.end();
});

tap.test("registerEvent() returns false if an event was registered with a non-unique name and throwOnNonUniqueEventName is not set", t => {
	let obs = new BindableObserver(EventEmitter);
	obs.throwOnNonUniqueEventName = false;
	obs.registerEvent(TestEvent1);

	t.doesNotThrow(() => obs.registerEvent(NonUniqueEvent), "Does not throw when throwOnNonUniqueEventName is not set.");
	t.equal(obs.registerEvent(NonUniqueEvent), false, "Return false when a non-unique event is registered and throwOnNonUniqueEventName is not set.");

	t.end();
});

tap.test("registerEvent() throws an error when throwOnNonUniqueEvent is set and a non-unique event is registered", t => {
	let obs = new BindableObserver(EventEmitter);
	obs.throwOnNonUniqueEventName = true;
	obs.registerEvent(TestEvent1);

	t.throws(() => obs.registerEvent(NonUniqueEvent), new NonUniqueNameRegisteredError((new NonUniqueEvent()).uniqueName, TestEvent1 as new <T extends Event>(...args: any) => T, NonUniqueEvent as new <T extends Event>(...args: any) => T), "Registering a non-unique event throws an error when throwOnNonUniqueEventName is set.");

	t.end();
});

tap.test("getOrCreateEventSymbol() gets the symbol made for an event", t => {
	let obs = new BindableObserver(EventEmitter);
	obs.throwOnNonUniqueEventName = false;
	obs.registerEvent(TestEvent1);
	obs.registerEvent(TestEvent2);
	obs.registerEvent(TestEvent3, true);
	obs.registerEvent(TestEvent4, true);

	// Gets a registered event symbol
	t.doesNotThrow(() => obs.getOrCreateEventSymbol(TestEvent1), "Does not throw errors when obtaining non-uniquely-registered symbol.");

	let obtainedSymbol = obs.getOrCreateEventSymbol(TestEvent2);
	t.notEqual(obtainedSymbol, undefined, "Non-uniquely-registered symbol found.");
	t.equal((obtainedSymbol as symbol & { description: string; }).description, (new TestEvent2()).uniqueName, "Obtained a non-uniquely-registered symbol with the correct description.");

	// Gets an override event symbol
	t.doesNotThrow(() => obs.getOrCreateEventSymbol(TestEvent3), "Does not throw errors when obtaining uniquely-registered symbol.");

	obtainedSymbol = obs.getOrCreateEventSymbol(TestEvent4);
	t.notEqual(obtainedSymbol, undefined, "Uniquely-registered symbol found.");
	t.equal((obtainedSymbol as symbol & { description: string; }).description, (new TestEvent4()).uniqueName, "Obtained a uniquely-registered symbol with the correct description.");

	t.end();
});

tap.test("getOrCreateEventSymbol() registers an unregistered event and gets its symbol.", t => {
	let obs = new BindableObserver(EventEmitter);
	obs.throwOnNonUniqueEventName = false;

	t.doesNotThrow(() => obs.getOrCreateEventSymbol(TestEvent1), "Does not throw errors when getting an unregistered event type.");

	let obtainedSymbol = obs.getOrCreateEventSymbol(TestEvent2);
	t.notEqual(obtainedSymbol, undefined, "Unregistered event did not result in undefined return.");
	t.equal((obtainedSymbol as symbol & { description: string; }).description, (new TestEvent2()).uniqueName, "Unregistered event registered and returned as a new symbol.");

	t.end();
});

tap.test("getOrCreateEventSymbol() throws an error when throwOnNonUniqueEvent is set and an unregistered non-unique event is gotten", t => {
	let obs = new BindableObserver(EventEmitter);
	obs.throwOnNonUniqueEventName = true;
	obs.registerEvent(TestEvent1);

	t.throws(() => obs.getOrCreateEventSymbol(NonUniqueEvent), new NonUniqueNameRegisteredError((new NonUniqueEvent()).uniqueName, TestEvent1 as new <T extends Event>(...args: any) => T, NonUniqueEvent as new <T extends Event>(...args: any) => T), "Getting an unregistered, non-unique event throws an error when throwOnNonUniqueEventName is set.");

	t.end();
});

tap.test("getOrCreateEventSymbol() returns undefined when throwOnNonUniqueEvent is not set and an unregistered non-unique event is gotten", t => {
	let obs = new BindableObserver(EventEmitter);
	obs.throwOnNonUniqueEventName = false;
	obs.registerEvent(TestEvent1);

	t.doesNotThrow(() => obs.getOrCreateEventSymbol(NonUniqueEvent), "Getting an unregistered, non-unique event does not throw an error when throwOnNonUniqueEventName is not set.");

	t.equal(obs.getOrCreateEventSymbol(NonUniqueEvent), undefined, "Getting an unregistered, non-unique event returns undefined when throwOnNonUniqueEventName is not set.");

	t.end();
});

tap.test("getEventSymbol() returns the registered event's internal symbol", t => {
	let obs = new BindableObserver(EventEmitter);
	obs.throwOnNonUniqueEventName = true;
	obs.registerEvent(TestEvent1);
	obs.registerEvent(TestEvent2, true);

	t.notEqual(obs.getEventSymbol(TestEvent1), undefined, "Returned a symbol for a registered event.");
	t.notEqual(obs.getEventSymbol(TestEvent2), undefined, "Returned a symbol for a registered unique event.");
	t.equal(obs.getEventSymbol(TestEvent3), undefined, "Returned undefined for non-registered event.");

	t.end();
});

tap.test("unregisterEvent() returns true when successfully unregistering events", t => {
	let obs = new BindableObserver(EventEmitter);

	obs.registerEvent(TestEvent1);
	obs.registerEvent(TestEvent2, true);
	obs.registerEvent(TestEvent3);
	obs.registerEvent(TestEvent4, true);

	t.equal(obs.unregisterEvent(TestEvent1), true, "Return true on unregistering a non-uniquely registered event type.");
	t.equal(obs.unregisterEvent(TestEvent2), true, "Return true on unregistering a uniquely registered event type.");

	let e3 = new TestEvent3();
	let e4 = new TestEvent4();

	t.equal(obs.unregisterEvent(e3), true, "Return true on unregistering a non-uniquely registered event instance.");
	t.equal(obs.unregisterEvent(e4), true, "Return true on unregistering a uniquely registered event instance.");

	t.end();
});

tap.test("unregisterEvent() returns false when unregistering a non-registered event", t => {
	let obs = new BindableObserver(EventEmitter);

	t.equal(obs.unregisterEvent(TestEvent1), false, "Return false on unregistering an unregistered event.");

	t.end();
});

tap.test("emit() handles being unable to create an event symbol when throwOnNonUniqueEvent is set to false", t => {
	let obs = new BindableObserver(EventEmitter);
	obs.throwOnNonUniqueEventName = false;
	obs.registerEvent(TestEvent1);

	t.doesNotThrow(() => { obs.emit(new NonUniqueEvent()); }, "Failing to register an event does not throw an error in emit().");
	t.end();
});

tap.test("on() handles being unable to create an event symbol when throwOnNonUniqueEvent is set to false", t => {
	let obs = new BindableObserver(EventEmitter);
	obs.throwOnNonUniqueEventName = false;
	obs.registerEvent(TestEvent1);

	t.doesNotThrow(() => { obs.on(NonUniqueEvent, () => {}); }, "Failing to register an event does not throw an error in on().");
	t.end();
});

tap.test("once() handles being unable to create an event symbol when throwOnNonUniqueEvent is set to false", t => {
	let obs = new BindableObserver(EventEmitter);
	obs.throwOnNonUniqueEventName = false;
	obs.registerEvent(TestEvent1);

	t.doesNotThrow(() => { obs.once(NonUniqueEvent, () => {}); }, "Failing to register an event does not throw an error in once().");
	t.end();
});

tap.test("prependListener() handles being unable to create an event symbol when throwOnNonUniqueEvent is set to false", t => {
	let obs = new BindableObserver(EventEmitter);
	obs.throwOnNonUniqueEventName = false;
	obs.registerEvent(TestEvent1);

	t.doesNotThrow(() => { obs.prependListener(NonUniqueEvent, () => {}); }, "Failing to register an event does not throw an error in prependListener().");
	t.end();
});

tap.test("prependOnceListener() handles being unable to create an event symbol when throwOnNonUniqueEvent is set to false", t => {
	let obs = new BindableObserver(EventEmitter);
	obs.throwOnNonUniqueEventName = false;
	obs.registerEvent(TestEvent1);

	t.doesNotThrow(() => { obs.prependOnceListener(NonUniqueEvent, () => {}); }, "Failing to register an event does not throw an error in prependOnceListener().");
	t.end();
});

