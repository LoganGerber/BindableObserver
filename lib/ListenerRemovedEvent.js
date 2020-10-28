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
exports.ListenerRemovedEvent = void 0;
var Event_1 = require("./Event");
/**
 * Event emitted whenever a listener is removed.
 */
var ListenerRemovedEvent = /** @class */ (function (_super) {
    __extends(ListenerRemovedEvent, _super);
    function ListenerRemovedEvent(observer, listener, event) {
        var _this = _super.call(this) || this;
        _this.observer = observer;
        _this.listener = listener;
        _this.event = event;
        return _this;
    }
    ListenerRemovedEvent.prototype.name = function () { return "Listener Removed"; };
    Object.defineProperty(ListenerRemovedEvent.prototype, "uniqueName", {
        get: function () { return "LoganGerber-BindableObserver-ListenerRemovedEvent"; },
        enumerable: false,
        configurable: true
    });
    return ListenerRemovedEvent;
}(Event_1.Event));
exports.ListenerRemovedEvent = ListenerRemovedEvent;
