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
exports.ObserverUnboundEvent = void 0;
var Event_1 = require("./Event");
/**
 * Event emitte3d when a BindableObserver is unbound from another
 * BindableObserver using unbind().
 */
var ObserverUnboundEvent = /** @class */ (function (_super) {
    __extends(ObserverUnboundEvent, _super);
    function ObserverUnboundEvent(bindingObserver, boundedObserver) {
        var _this = _super.call(this) || this;
        _this.bindingObserver = bindingObserver;
        _this.boundedObserver = boundedObserver;
        return _this;
    }
    Object.defineProperty(ObserverUnboundEvent.prototype, "name", {
        get: function () { return "Observer Unbound"; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ObserverUnboundEvent.prototype, "uniqueName", {
        get: function () { return "LoganGerber-BindableObserver-ObserverUnboundEvent"; },
        enumerable: false,
        configurable: true
    });
    return ObserverUnboundEvent;
}(Event_1.Event));
exports.ObserverUnboundEvent = ObserverUnboundEvent;
