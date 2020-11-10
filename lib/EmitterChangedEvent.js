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
exports.EmitterChangedEvent = void 0;
var Event_1 = require("./Event");
/**
 * Event called when a BindableObserver's setInternalEmitter() function is
 * called.
 *
 * This is only emitted on the emitter that is being replaced, and not the
 * new emitter being set.
 */
var EmitterChangedEvent = /** @class */ (function (_super) {
    __extends(EmitterChangedEvent, _super);
    function EmitterChangedEvent(observer, formerEmitter, newEmitter) {
        var _this = _super.call(this) || this;
        _this.observer = observer;
        _this.formerEmitter = formerEmitter;
        _this.newEmitter = newEmitter;
        return _this;
    }
    Object.defineProperty(EmitterChangedEvent.prototype, "name", {
        get: function () { return "Emitter Changed"; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EmitterChangedEvent.prototype, "uniqueName", {
        get: function () { return "LoganGerber-BindableObserver-EmitterChangedEvent"; },
        enumerable: false,
        configurable: true
    });
    return EmitterChangedEvent;
}(Event_1.Event));
exports.EmitterChangedEvent = EmitterChangedEvent;
