import * as tap from "tap";
import { EventObserver, RelayFlags } from "../src/EventObserver";
import { Event } from "../src/Event";
import { EmitEvent } from "../src/EmitEvent";

class TestEvent1 extends Event { name() { return "TestEvent1"; } };
class TestEvent2 extends Event { name() { return "TestEvent2"; } };
class TestEvent3 extends Event { name() { return "TestEvent3"; } };
class TestEvent4 extends Event { name() { return "TestEvent4"; } };

// NOTE: There is no test for checking if emit() correctly emits an Event.
// NOTE: There is no test for checking if getIdCacheSize() gets the correct length of cache.
// NOTE: There is no test for checking if getIdCacheLimit() gets the correct limit of cache size.

// 1: -
tap.test("setIdCacheLimit() sets the guid cache size", t => {
    let obs = new EventObserver();
    let event1 = new TestEvent1();
    let event2 = new TestEvent1();
    let event3 = new TestEvent1();

    obs.setIdCacheLimit(10);

    t.equal(obs.getIdCacheLimit(), 10, "change cache limit from default");

    obs.setIdCacheLimit(2);

    t.equal(obs.getIdCacheLimit(), 2, "shrink cache limit");

    obs.setIdCacheLimit(0);

    t.equal(obs.getIdCacheLimit(), 0, "set cache limit to zero (unlimited)");

    obs.setIdCacheLimit(1);

    t.equal(obs.getIdCacheLimit(), 1, "change cache limit from unlimited");

    obs.setIdCacheLimit(35);

    t.equal(obs.getIdCacheLimit(), 35, "expand cache limit");

    obs.setIdCacheLimit(-48);
    t.equal(obs.getIdCacheLimit(), 0, "change cache limit to negative value");

    obs.setIdCacheLimit(2);
    obs.emit(event1);
    obs.emit(event2);
    obs.emit(event3);
    t.equal(obs.getIdCacheSize(), 2, "cache limited");

    t.end();
});

// 3: -
tap.test("addListener() binds a function to an event", t => {
    let obs = new EventObserver();
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

// 4: -
tap.test("on() binds a function to an event", t => {
    let obs = new EventObserver();
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

// 5: -
tap.test("once() binds a function to an event", t => {
    let obs = new EventObserver();
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

// 2: 4
tap.test("clearIdCache() clears guid cache", t => {
    let obs = new EventObserver();
    let event = new TestEvent1();
    let executionCount = 0;

    obs.setIdCacheLimit(5);
    obs.on(TestEvent1, () => executionCount++);

    t.equal(obs.getIdCacheSize(), 0, "no guids in cache before emitting event");

    obs.emit(event);
    obs.clearIdCache();

    t.equal(obs.getIdCacheSize(), 0, "cache cleared");

    obs.emit(event);

    t.equal(executionCount, 2, "event executed successfully after clear");

    t.end();
});

// 6: 4
tap.test("off() unbinds a function from an event", t => {
    let obs = new EventObserver();
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

// 7: 4
tap.test("removeListener() unbinds a function from an event", t => {
    let obs = new EventObserver();
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

// 8: 4
tap.test("prependListener() binds a function to an event", t => {
    let obs = new EventObserver();
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

// 9: 4
tap.test("prependOnceListener() binds a function to an event.", t => {
    let obs = new EventObserver();
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

// 10: 4
tap.test("removeAllListeners() unbinds all functions from events", t => {
    let obs = new EventObserver();
    let event11 = new TestEvent1();
    let event12 = new TestEvent1();
    let event21 = new TestEvent2();
    let event22 = new TestEvent2();
    let event31 = new TestEvent3();
    let ev1Count = 0;
    let ev2Count = 0;
    let ev3Count = 0;

    obs.on(TestEvent1, () => ev1Count++);
    obs.on(TestEvent2, () => ev2Count++);
    obs.on(TestEvent3, () => ev3Count++);
    obs.removeAllListeners(TestEvent1);
    obs.emit(event11);
    obs.emit(event12);
    obs.emit(event21);

    t.equal(ev1Count, 0, "removed all listeners from an event");
    t.equal(ev2Count, 1, "kept unaffected events and listeners");

    obs.removeAllListeners();
    obs.emit(event22);
    obs.emit(event31);

    t.equal(ev2Count, 1, "removed testevent2 when removing all listeners");
    t.equal(ev3Count, 0, "removed testevent3 when removing all listeners");

    t.end();
});

// 11: 4
tap.test("hasListener() checks if a listener is bound to an event", t => {
    let obs = new EventObserver();
    let f1 = () => { };
    let f2 = () => { };
    let event = new TestEvent1();

    obs.on(TestEvent1, f1);

    t.equal(obs.hasListener(TestEvent1, f1), true, "found listener with class");
    t.equal(obs.hasListener(event, f1), true, "found listener with instance");
    t.equal(obs.hasListener(TestEvent1, f2), false, "did not find listener");

    t.end();
});

// 12: 4
tap.test("emit() emits an EventInvokedEvent for an event", t => {
    let obs = new EventObserver();
    let event = new TestEvent1();
    let executed = false;

    obs.on(EmitEvent, e => {
        executed = (e as EmitEvent).emitted.id.equals(event.id);
    });
    obs.emit(event);

    t.equal(executed, true, "EventInvokedEvent sent after emit");
    t.end();
});

// 13: 1, 4
tap.test("cache prevents repeated event handling", t => {
    let obs = new EventObserver();
    let evokeCount = 0;
    let event1 = new TestEvent1();
    let event2 = new TestEvent1();

    obs.setIdCacheLimit(5);
    obs.on(TestEvent1, () => evokeCount++);
    obs.emit(event1);
    obs.emit(event1);

    t.equal(evokeCount, 1, "event stopped by cache");
    t.equal(obs.getIdCacheSize(), 1, "cache only stored one event");

    obs.emit(event2);

    t.equal(evokeCount, 2, "event not stopped by cache");
    t.equal(obs.getIdCacheSize(), 2, "cache stored second event");
    t.end();
});

// 14: 1, 4
tap.test("cache limit removes oldest cached items", t => {
    let obs = new EventObserver();
    let event1 = new TestEvent1();
    let event2 = new TestEvent1();
    let event3 = new TestEvent1();
    let evokeCount = 0;

    obs.setIdCacheLimit(2);
    obs.on(TestEvent1, () => evokeCount++);
    obs.emit(event1);
    obs.emit(event2);
    obs.emit(event3);
    obs.emit(event1);

    t.equal(evokeCount, 4, "old cache removed");
    t.equal(obs.getIdCacheSize(), 2, "cache length matches limit");
    t.end();
});

// 22: 2, 4
tap.test("checkBinding() returns the binding status of a SimpleObserver to another", t => {
    let obs1 = new EventObserver();
    let obs2 = new EventObserver();
    let event1 = new TestEvent1();
    let event2 = new TestEvent2();
    let evokedFrom = false;
    let evokedTo = false;

    t.equal(obs1.checkBinding(obs2), undefined, "checkBinding() return undefined for unbound observers");

    obs1.on(TestEvent2, () => evokedFrom = true);
    obs2.on(TestEvent1, () => evokedTo = true);
    obs1.bind(obs2, RelayFlags.From);
    obs1.emit(event1);
    obs2.emit(event2);

    let expected = RelayFlags.None |
        (evokedFrom ? RelayFlags.From : RelayFlags.None) |
        (evokedTo ? RelayFlags.To : RelayFlags.None);

    t.equal(obs1.checkBinding(obs2), expected, "checkBinding() pass 1");

    evokedFrom = false;
    evokedTo = false;
    obs1.clearIdCache();
    obs2.clearIdCache();

    obs1.bind(obs2, RelayFlags.To);
    obs1.emit(event1);
    obs2.emit(event2);

    expected = RelayFlags.None |
        (evokedFrom ? RelayFlags.From : RelayFlags.None) |
        (evokedTo ? RelayFlags.To : RelayFlags.None);

    t.equal(obs1.checkBinding(obs2), expected, "checkBinding() pass 2");

    evokedFrom = false;
    evokedTo = false;
    obs1.clearIdCache();
    obs2.clearIdCache();

    obs1.bind(obs2, RelayFlags.All);
    obs1.emit(event1);
    obs2.emit(event2);

    expected = RelayFlags.None |
        (evokedFrom ? RelayFlags.From : RelayFlags.None) |
        (evokedTo ? RelayFlags.To : RelayFlags.None);

    t.equal(obs1.checkBinding(obs2), expected, "checkBinding() pass 3");

    evokedFrom = false;
    evokedTo = false;
    obs1.clearIdCache();
    obs2.clearIdCache();

    obs1.bind(obs2, RelayFlags.None);
    obs1.emit(event1);
    obs2.emit(event2);

    expected = RelayFlags.None |
        (evokedFrom ? RelayFlags.From : RelayFlags.None) |
        (evokedTo ? RelayFlags.To : RelayFlags.None);

    t.equal(obs1.checkBinding(obs2), expected, "checkBinding() pass 4");
    t.end();
});

// 15: 22
tap.test("bind() binds a relay and adds it to the list of bound relays", t => {
    let obs1 = new EventObserver();
    let obs2 = new EventObserver();
    let bindingStatus: RelayFlags;

    obs1.bind(obs2, RelayFlags.All);
    bindingStatus = obs1.checkBinding(obs2);

    t.equal(bindingStatus, RelayFlags.All);
    t.end();
});

// 16: 4, 15
tap.test("bound observers with RelayFlags.To can forward events", t => {
    let obs1 = new EventObserver();
    let obs2 = new EventObserver();
    let event1 = new TestEvent1();
    let event2 = new TestEvent2();
    let event3 = new TestEvent3();
    let event4 = new TestEvent4();
    let evoked1 = false;
    let evoked2 = false;
    let evoked3 = false;
    let evoked4 = false;

    // in obs1, not in obs2
    // in obs1, in obs2
    // not in obs1, in obs2
    // not in obs1, not in obs2
    obs1.on(TestEvent1, () => { });
    obs1.on(TestEvent2, () => { });
    obs2.on(TestEvent2, () => evoked2 = true);
    obs2.on(TestEvent3, () => evoked3 = true);
    obs1.bind(obs2, RelayFlags.To);
    obs2.on(TestEvent1, () => evoked1 = true);
    obs2.on(TestEvent4, () => evoked4 = true);
    obs1.emit(event1);
    obs1.emit(event2);
    obs1.emit(event3);
    obs1.emit(event4);

    t.equal(evoked1, true, "send event originally in 1, not in 2");
    t.equal(evoked2, true, "send event originally in 1 and 2");
    t.equal(evoked3, true, "send event not originally in 1, in 2");
    t.equal(evoked4, true, "send event not originally in 1 or 2");
    t.end();
});

// 17: 4, 15
tap.test("bound observers with RelayFlags.From can receive events", t => {
    let obs1 = new EventObserver();
    let obs2 = new EventObserver();
    let event1 = new TestEvent1();
    let event2 = new TestEvent2();
    let event3 = new TestEvent3();
    let event4 = new TestEvent4();
    let evoked1 = false;
    let evoked2 = false;
    let evoked3 = false;
    let evoked4 = false;

    // in obs1, not in obs2
    // in obs1, in obs2
    // not in obs1, in obs2
    // not in obs1, not in obs2
    obs1.on(TestEvent1, () => evoked1 = true);
    obs1.on(TestEvent2, () => evoked2 = true);
    obs2.on(TestEvent2, () => { });
    obs2.on(TestEvent3, () => { });
    obs1.bind(obs2, RelayFlags.From);
    obs1.on(TestEvent3, () => evoked3 = true);
    obs1.on(TestEvent4, () => evoked4 = true);
    obs2.emit(event1);
    obs2.emit(event2);
    obs2.emit(event3);
    obs2.emit(event4);

    t.equal(evoked1, true, "retrieve event originally in 1, not in 2");
    t.equal(evoked2, true, "retrieve event originally in 1 and 2");
    t.equal(evoked3, true, "retrieve event not originally in 1, in 2");
    t.equal(evoked4, true, "retrieve event not originally in 1 or 2");
    t.end();
});

// 18: 2, 4, 15
tap.test("bound observers with RelayFlags.None do not send events", t => {
    let obs1 = new EventObserver();
    let obs2 = new EventObserver();
    let event1 = new TestEvent1();
    let event2 = new TestEvent2();
    let event3 = new TestEvent3();
    let event4 = new TestEvent4();
    let evoked11 = false;
    let evoked21 = false;
    let evoked12 = false;
    let evoked22 = false;
    let evoked13 = false;
    let evoked23 = false;
    let evoked14 = false;
    let evoked24 = false;

    // in obs1, not in obs2
    // in obs1, in obs2
    // not in obs1, in obs2
    // not in obs1, not in obs2
    obs1.on(TestEvent1, () => evoked11 = true);
    obs1.on(TestEvent2, () => evoked12 = true);
    obs2.on(TestEvent2, () => evoked22 = true);
    obs2.on(TestEvent3, () => evoked23 = true);
    obs1.bind(obs2, RelayFlags.None);
    obs1.on(TestEvent3, () => evoked13 = true);
    obs1.on(TestEvent4, () => evoked14 = true);
    obs2.on(TestEvent1, () => evoked21 = true);
    obs2.on(TestEvent4, () => evoked24 = true);
    obs1.emit(event1);
    obs1.emit(event2);
    obs1.emit(event3);
    obs1.emit(event4);

    t.equal(evoked21, false, "2 didnt retrieve event originally in 1, not in 2");
    t.equal(evoked22, false, "2 didnt retrieve event originally in 1 and 2");
    t.equal(evoked23, false, "2 didnt retrieve event not originally in 1, in 2");
    t.equal(evoked24, false, "2 didnt retrieve event not originally in 1 or 2");

    obs1.clearIdCache();
    obs2.clearIdCache();
    evoked11 = false;
    evoked12 = false;
    evoked13 = false;
    evoked14 = false;

    obs2.emit(event1);
    obs2.emit(event2);
    obs2.emit(event3);
    obs2.emit(event4);

    t.equal(evoked11, false, "1 didnt retrieve event originally in 1, not in 2");
    t.equal(evoked12, false, "1 didnt retrieve event originally in 1 and 2");
    t.equal(evoked13, false, "1 didnt retrieve event not originally in 1, in 2");
    t.equal(evoked14, false, "1 didnt retrieve event not originally in 1 or 2");
    t.end();
});

// 19: 2, 4, 15
tap.test("bound observers with RelayFlags.All can forward and receive events", t => {
    let obs1 = new EventObserver();
    let obs2 = new EventObserver();
    let event1 = new TestEvent1();
    let event2 = new TestEvent2();
    let event3 = new TestEvent3();
    let event4 = new TestEvent4();
    let evoked11 = false;
    let evoked21 = false;
    let evoked12 = false;
    let evoked22 = false;
    let evoked13 = false;
    let evoked23 = false;
    let evoked14 = false;
    let evoked24 = false;

    // in obs1, not in obs2
    // in obs1, in obs2
    // not in obs1, in obs2
    // not in obs1, not in obs2
    obs1.on(TestEvent1, () => evoked11 = true);
    obs1.on(TestEvent2, () => evoked12 = true);
    obs2.on(TestEvent2, () => evoked22 = true);
    obs2.on(TestEvent3, () => evoked23 = true);
    obs1.bind(obs2, RelayFlags.All);
    obs1.on(TestEvent3, () => evoked13 = true);
    obs1.on(TestEvent4, () => evoked14 = true);
    obs2.on(TestEvent1, () => evoked21 = true);
    obs2.on(TestEvent4, () => evoked24 = true);
    obs1.emit(event1);
    obs1.emit(event2);
    obs1.emit(event3);
    obs1.emit(event4);

    t.equal(evoked21, true, "2 retrieve event originally in 1, not in 2");
    t.equal(evoked22, true, "2 retrieve event originally in 1 and 2");
    t.equal(evoked23, true, "2 retrieve event not originally in 1, in 2");
    t.equal(evoked24, true, "2 retrieve event not originally in 1 or 2");

    obs1.clearIdCache();
    obs2.clearIdCache();
    evoked11 = false;
    evoked12 = false;
    evoked13 = false;
    evoked14 = false;

    obs2.emit(event1);
    obs2.emit(event2);
    obs2.emit(event3);
    obs2.emit(event4);

    t.equal(evoked11, true, "1 retrieve event originally in 1, not in 2");
    t.equal(evoked12, true, "1 retrieve event originally in 1 and 2");
    t.equal(evoked13, true, "1 retrieve event not originally in 1, in 2");
    t.equal(evoked14, true, "1 retrieve event not originally in 1 or 2");
    t.end();
});

// 20: 2, 4, 15, 16, 17, 18, 19
tap.test("bind() changes the relay of bound observers", t => {
    let obs1 = new EventObserver();
    let obs2 = new EventObserver();
    let event11 = new TestEvent1();
    let event12 = new TestEvent1();
    let event13 = new TestEvent1();
    let event14 = new TestEvent1();
    let event21 = new TestEvent2();
    let event22 = new TestEvent2();
    let event23 = new TestEvent2();
    let event24 = new TestEvent2();
    let evokedFrom = false;
    let evokedTo = false;

    obs1.on(TestEvent1, () => evokedFrom = true);
    obs2.on(TestEvent2, () => evokedTo = true);

    // Initialize as none
    obs1.bind(obs2, RelayFlags.None);
    obs1.emit(event21);
    obs2.emit(event11);

    t.equal(evokedFrom, false, "event not relayed from with RelayFlags.None");
    t.equal(evokedTo, false, "event not relayed to with RelayFlags.None");

    evokedFrom = false;
    evokedTo = false;

    // change to From
    obs1.clearIdCache();
    obs2.clearIdCache();

    obs1.bind(obs2, RelayFlags.From);
    obs1.emit(event22);
    obs2.emit(event12);

    t.equal(evokedFrom, true, "event relayed from after setRelayFlags(RelayFlags.From)");
    t.equal(evokedTo, false, "event not relayed to after setRelayFlags(RelayFlags.From)");

    evokedFrom = false;
    evokedTo = false;

    // change to All
    obs1.clearIdCache();
    obs2.clearIdCache();

    obs1.bind(obs2, RelayFlags.All);
    obs1.emit(event24);
    obs2.emit(event14);

    t.equal(evokedFrom, true, "event relayed from after setRelayFlags(RelayFlags.All)");
    t.equal(evokedTo, true, "event relayed to after setRelayFlags(RelayFlags.All)");

    evokedFrom = false;
    evokedTo = false;

    // change to To
    obs1.clearIdCache();
    obs2.clearIdCache();

    obs1.bind(obs2, RelayFlags.To);
    obs1.emit(event23);
    obs2.emit(event13);

    t.equal(evokedFrom, false, "event not relayed from after setRelayFlags(RelayFlags.To)");
    t.equal(evokedTo, true, "event relayed to after setRelayFlags(RelayFlags.To)");

    evokedFrom = false;
    evokedTo = false;

    // change to none
    obs1.clearIdCache();
    obs2.clearIdCache();

    obs1.bind(obs2, RelayFlags.None);
    obs1.emit(event21);
    obs2.emit(event11);

    t.equal(evokedFrom, false, "event not relayed from with RelayFlags.None");
    t.equal(evokedTo, false, "event not relayed to with RelayFlags.None");

    evokedFrom = false;
    evokedTo = false;

    // change to To
    obs1.clearIdCache();
    obs2.clearIdCache();

    obs1.bind(obs2, RelayFlags.To);
    obs1.emit(event23);
    obs2.emit(event13);

    t.equal(evokedFrom, false, "event not relayed from after setRelayFlags(RelayFlags.To)");
    t.equal(evokedTo, true, "event relayed to after setRelayFlags(RelayFlags.To)");

    evokedFrom = false;
    evokedTo = false;

    // change to All
    obs1.clearIdCache();
    obs2.clearIdCache();

    obs1.bind(obs2, RelayFlags.All);
    obs1.emit(event24);
    obs2.emit(event14);

    t.equal(evokedFrom, true, "event relayed from after setRelayFlags(RelayFlags.All)");
    t.equal(evokedTo, true, "event relayed to after setRelayFlags(RelayFlags.All)");

    evokedFrom = false;
    evokedTo = false;

    // change to From
    obs1.clearIdCache();
    obs2.clearIdCache();

    obs1.bind(obs2, RelayFlags.From);
    obs1.emit(event22);
    obs2.emit(event12);

    t.equal(evokedFrom, true, "event relayed from after setRelayFlags(RelayFlags.From)");
    t.equal(evokedTo, false, "event not relayed to after setRelayFlags(RelayFlags.From)");
    t.end();
});

// 21: 22
tap.test("bind() default sets RelayFlags to RelayFlags.All", t => {
    let obs1 = new EventObserver();
    let obs2 = new EventObserver();

    obs1.bind(obs2);

    t.equal(obs1.checkBinding(obs2), RelayFlags.All, "default binding is RelayFlags.All");
    t.end();
});

// 23: 2, 4, 16, 17, 19, 22
tap.test("unbind() unbinds observers", t => {
    let obs1 = new EventObserver();
    let obs2 = new EventObserver();
    let event1 = new TestEvent1();
    let event2 = new TestEvent2();
    let evoked1 = false;
    let evoked2 = false;
    let setEvokeFunction1: () => void = () => evoked1 = true;
    let setEvokeFunction2: () => void = () => evoked2 = true;

    obs1.on(TestEvent1, setEvokeFunction1);
    obs1.bind(obs2, RelayFlags.From);
    obs1.unbind(obs2);
    obs2.emit(event1);

    t.equal(evoked1, false, "unbinded from RelayFlags.From binding");

    evoked1 = false;
    obs1.removeListener(TestEvent1, setEvokeFunction1);
    obs1.clearIdCache();

    obs2.on(TestEvent1, setEvokeFunction1);
    obs1.bind(obs2, RelayFlags.To);
    obs1.unbind(obs2);
    obs1.emit(event1);

    t.equal(evoked1, false, "unbinded from RelayFlags.To binding");

    evoked1 = false;
    obs2.removeListener(TestEvent1, setEvokeFunction1);
    obs1.clearIdCache();

    obs1.on(TestEvent1, setEvokeFunction1);
    obs2.on(TestEvent2, setEvokeFunction2);
    obs1.bind(obs2, RelayFlags.All);
    obs1.unbind(obs2);
    obs1.emit(event2);
    obs2.emit(event1);

    t.equal(evoked1, false, "unbinded 'from' from RelayFlags.All binding");
    t.equal(evoked2, false, "unbinded 'to' from RelayFlags.All binding");
    t.doesNotThrow(() => obs1.unbind(obs2), "unbind does not throw an error when unbinding two non-bound observers");
    t.end();
});
