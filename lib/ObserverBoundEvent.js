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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObserverBoundEvent = void 0;
var Event_1 = require("./Event");
/**
 * Event emitted whenever a BindableObserver is bound to another
 * BindableObserver using bind(), or when a bound observer's RelayFlags are
 * changed.
 */
var ObserverBoundEvent = /** @class */ (function (_super) {
    __extends(ObserverBoundEvent, _super);
    function ObserverBoundEvent(bindingObserver, boundedObserver) {
        var _this = _super.call(this) || this;
        _this._bindingObserver = bindingObserver;
        _this._boundedObserver = boundedObserver;
        return _this;
    }
    Object.defineProperty(ObserverBoundEvent.prototype, "bindingObserver", {
        /**
         * Observer whose `bind()` function is being called.
         */
        get: function () {
            return this._bindingObserver;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ObserverBoundEvent.prototype, "boundedObserver", {
        /**
         * Observer that is being bound to the `bindingObserver`.
         */
        get: function () {
            return this._boundedObserver;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ObserverBoundEvent.prototype, "name", {
        get: function () { return "Observer Bound"; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ObserverBoundEvent.prototype, "uniqueName", {
        get: function () { return "LoganGerber-BindableObserver-ObserverBoundEvent"; },
        enumerable: false,
        configurable: true
    });
    return ObserverBoundEvent;
}(Event_1.Event));
exports.ObserverBoundEvent = ObserverBoundEvent;
