"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var tap = require("tap");
var SimpleObserver_1 = require("../src/SimpleObserver");
var Event_1 = require("../src/Event");
var TestEvent1 = /** @class */ (function (_super) {
    __extends(TestEvent1, _super);
    function TestEvent1() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return TestEvent1;
}(Event_1.Event));
;
var TestEvent2 = /** @class */ (function (_super) {
    __extends(TestEvent2, _super);
    function TestEvent2() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return TestEvent2;
}(Event_1.Event));
;
var TestEvent3 = /** @class */ (function (_super) {
    __extends(TestEvent3, _super);
    function TestEvent3() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return TestEvent3;
}(Event_1.Event));
;
var TestEvent4 = /** @class */ (function (_super) {
    __extends(TestEvent4, _super);
    function TestEvent4() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return TestEvent4;
}(Event_1.Event));
;
// TODO:
//  * prependListener()
//  * prependOnceListener()
//  * removeAllListeners()
//  * hasListener()
//  * emit()
//  * setIdCacheLimit()
//  * clearIdCache()
tap.test("addListener() binds a function to an event", function (t) {
    var obs = new SimpleObserver_1.SimpleObserver();
    var evoked1Count = 0;
    var evoked2Count = 0;
    var event1 = new TestEvent2();
    var event2 = new TestEvent2();
    obs.addListener(TestEvent1, function () { return evoked1Count++; });
    obs.addListener(event1, function () { return evoked2Count++; });
    obs.emit(new TestEvent1());
    obs.emit(new TestEvent1());
    obs.emit(event1);
    obs.emit(event2);
    t.equal(evoked1Count, 2, "addListener() event class bound");
    t.equal(evoked2Count, 2, "addListener() event instance bound");
    t.end();
});
tap.test("on() binds a function to an event", function (t) {
    var obs = new SimpleObserver_1.SimpleObserver();
    var evoked1Count = 0;
    var evoked2Count = 0;
    var event1 = new TestEvent2();
    var event2 = new TestEvent2();
    obs.on(TestEvent1, function () { return evoked1Count++; });
    obs.on(event1, function () { return evoked2Count++; });
    obs.emit(new TestEvent1());
    obs.emit(new TestEvent1());
    obs.emit(event1);
    obs.emit(event2);
    t.equal(evoked1Count, 2, "on() event class bound");
    t.equal(evoked2Count, 2, "on() event instance bound");
    t.end();
});
tap.test("once() binds a function to an event", function (t) {
    var obs = new SimpleObserver_1.SimpleObserver();
    var evoked1Count = 0;
    var evoked2Count = 0;
    var event1 = new TestEvent2();
    var event2 = new TestEvent2();
    obs.once(TestEvent1, function () { return evoked1Count++; });
    obs.once(event2, function () { return evoked2Count++; });
    obs.emit(new TestEvent1());
    obs.emit(new TestEvent1());
    obs.emit(event1);
    obs.emit(event2);
    t.equal(evoked1Count, 1, "once() event class bound");
    t.equal(evoked2Count, 1, "once() event instance bound");
    t.end();
});
tap.test("off() unbinds a function from an event", function (t) {
    var obs = new SimpleObserver_1.SimpleObserver();
    var evoked1Count = 0;
    var evoked2Count = 0;
    var evoked3Count = 0;
    var evoked4Count = 0;
    var event2 = new TestEvent2();
    var event3 = new TestEvent3();
    var event4 = new TestEvent4();
    var inc1 = function () { return evoked1Count++; };
    var inc2 = function () { return evoked2Count++; };
    var inc3 = function () { return evoked3Count++; };
    var inc4 = function () { return evoked4Count++; };
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
tap.test("removeListener() unbinds a function from an event", function (t) {
    var obs = new SimpleObserver_1.SimpleObserver();
    var evoked1Count = 0;
    var evoked2Count = 0;
    var evoked3Count = 0;
    var evoked4Count = 0;
    var event2 = new TestEvent2();
    var event3 = new TestEvent3();
    var event4 = new TestEvent4();
    var inc1 = function () { return evoked1Count++; };
    var inc2 = function () { return evoked2Count++; };
    var inc3 = function () { return evoked3Count++; };
    var inc4 = function () { return evoked4Count++; };
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
tap.test("Cache prevents repeated event handling", function (t) {
    // TODO: separate out a test for setIdCacheLimit()
    var obs = new SimpleObserver_1.SimpleObserver();
    var evokeCount = 0;
    var eventInstance = new TestEvent1();
    obs.setIdCacheLimit(2);
    obs.on(TestEvent1, function () { evokeCount++; });
    obs.emit(eventInstance);
    obs.emit(eventInstance);
    t.equal(evokeCount, 1, "event stopped by cache");
    t.equal(obs.getIdCacheSize(), 1, "cache only stored one event");
    t.end();
});
tap.test("cache limit removes oldest cached items", function (t) {
    var obs = new SimpleObserver_1.SimpleObserver();
    var events = [];
    for (var i = 0; i < 3; i++) {
        events.push(new TestEvent1());
    }
    var evokeCount = 0;
    obs.setIdCacheLimit(2);
    obs.on(TestEvent1, function () { evokeCount++; });
    obs.emit(events[0]);
    obs.emit(events[1]);
    obs.emit(events[2]);
    obs.emit(events[0]);
    t.equal(evokeCount, 4, "old cache removed");
    t.equal(obs.getIdCacheSize(), 2, "cache length matches limit");
    t.end();
});
tap.test("Bound observers can forward events", function (t) {
    var obs1 = new SimpleObserver_1.SimpleObserver();
    var obs2 = new SimpleObserver_1.SimpleObserver();
    var event = new TestEvent1();
    var fired = false;
    obs1.on(TestEvent1, function () { });
    obs1.bind(obs2, SimpleObserver_1.RelayFlags.To);
    obs2.on(TestEvent1, function () { return fired = true; });
    obs1.emit(event);
    t.equal(fired, true);
    t.end();
});
tap.test("Bound observers can receive events", function (t) {
    var obs1 = new SimpleObserver_1.SimpleObserver();
    var obs2 = new SimpleObserver_1.SimpleObserver();
    var events = [];
    events.push(new TestEvent1());
    events.push(new TestEvent2());
    var gotPreRegistered = false;
    var gotPostRegistered = false;
    obs1.on(TestEvent1, function () { gotPreRegistered = true; });
    obs1.on(TestEvent2, function () { gotPostRegistered = true; });
    obs2.on(TestEvent1, function () { });
    obs1.bind(obs2, SimpleObserver_1.RelayFlags.From);
    obs2.on(TestEvent2, function () { });
    obs2.emit(events[0]);
    obs2.emit(events[1]);
    t.equal(gotPreRegistered, true, "receive event made before binding");
    t.equal(gotPostRegistered, true, "receive event made after binding");
    t.end();
});
