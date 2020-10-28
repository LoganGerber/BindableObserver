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
exports.ListenerBoundEvent = void 0;
var Event_1 = require("./Event");
/**
 * Event emitted whenever a listener is bound to an Event through any binding function.
 */
var ListenerBoundEvent = /** @class */ (function (_super) {
    __extends(ListenerBoundEvent, _super);
    function ListenerBoundEvent(observer, listener, event, once) {
        var _this = _super.call(this) || this;
        _this.observer = observer;
        _this.listener = listener;
        _this.event = event;
        _this.once = once;
        return _this;
    }
    ListenerBoundEvent.prototype.name = function () { return "Listener Bound"; };
    Object.defineProperty(ListenerBoundEvent.prototype, "uniqueName", {
        get: function () { return "LoganGerber-BindableObserver-ListenerBoundEvent"; },
        enumerable: false,
        configurable: true
    });
    return ListenerBoundEvent;
}(Event_1.Event));
exports.ListenerBoundEvent = ListenerBoundEvent;
