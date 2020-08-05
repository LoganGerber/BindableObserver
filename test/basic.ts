import * as tap from "tap";
import { SimpleObserver, RelayFlags } from "../src/SimpleObserver";
import { Event } from "../src/Event";
import { EventInvokedEvent } from "../src/EventInvokedEvent";

class TestEvent1 extends Event { };
class TestEvent2 extends Event { };
class TestEvent3 extends Event { };
class TestEvent4 extends Event { };

// TODO:
//  * prependListener()
//  * prependOnceListener()
//  * removeAllListeners()
//  * hasListener()
//  * emit()
//  * setIdCacheLimit()
//  * clearIdCache()

tap.test("addListener() binds a function to an event", t => {
    let obs = new SimpleObserver();
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

tap.test("on() binds a function to an event", t => {
    let obs = new SimpleObserver();
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
    let obs = new SimpleObserver();
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

tap.test("off() unbinds a function from an event", t => {
    let obs = new SimpleObserver();
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

tap.test("removeListener() unbinds a function from an event", t => {
    let obs = new SimpleObserver();
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







tap.test("Cache prevents repeated event handling", t => {
    // TODO: separate out a test for setIdCacheLimit()
    let obs = new SimpleObserver();
    let evokeCount = 0;
    let eventInstance = new TestEvent1();

    obs.setIdCacheLimit(2);
    obs.on(TestEvent1, () => { evokeCount++; });
    obs.emit(eventInstance);
    obs.emit(eventInstance);

    t.equal(evokeCount, 1, "event stopped by cache");
    t.equal(obs.getIdCacheSize(), 1, "cache only stored one event");
    t.end();
});

tap.test("cache limit removes oldest cached items", t => {
    let obs = new SimpleObserver();
    let events = [];
    for (let i = 0; i < 3; i++) {
        events.push(new TestEvent1());
    }

    let evokeCount = 0;

    obs.setIdCacheLimit(2);

    obs.on(TestEvent1, () => { evokeCount++; });

    obs.emit(events[0]);
    obs.emit(events[1]);
    obs.emit(events[2]);
    obs.emit(events[0]);

    t.equal(evokeCount, 4, "old cache removed");
    t.equal(obs.getIdCacheSize(), 2, "cache length matches limit");

    t.end();

});

tap.test("Bound observers can forward events", t => {
    let obs1 = new SimpleObserver();
    let obs2 = new SimpleObserver();
    let event = new TestEvent1();
    let fired = false;

    obs1.on(TestEvent1, () => { });
    obs1.bind(obs2, RelayFlags.To);

    obs2.on(TestEvent1, () => fired = true);

    obs1.emit(event);

    t.equal(fired, true);
    t.end();
});

tap.test("Bound observers can receive events", t => {
    let obs1 = new SimpleObserver();
    let obs2 = new SimpleObserver();
    let events = [];
    events.push(new TestEvent1());
    events.push(new TestEvent2());

    let gotPreRegistered = false;
    let gotPostRegistered = false;

    obs1.on(TestEvent1, () => { gotPreRegistered = true; });
    obs1.on(TestEvent2, () => { gotPostRegistered = true; });
    obs2.on(TestEvent1, () => { });

    obs1.bind(obs2, RelayFlags.From);

    obs2.on(TestEvent2, () => { });

    obs2.emit(events[0]);
    obs2.emit(events[1]);

    t.equal(gotPreRegistered, true, "receive event made before binding");
    t.equal(gotPostRegistered, true, "receive event made after binding");

    t.end();
});
