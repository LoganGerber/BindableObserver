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
exports.CacheLimitChangedEvent = void 0;
var Event_1 = require("./Event");
/**
 * Event executed when a BindableObserver's cache limit is changed.
 */
var CacheLimitChangedEvent = /** @class */ (function (_super) {
    __extends(CacheLimitChangedEvent, _super);
    function CacheLimitChangedEvent(observer, formerLimit, newLimit) {
        var _this = _super.call(this) || this;
        _this.observer = observer;
        _this.formerLimit = formerLimit;
        _this.newLimit = newLimit;
        return _this;
    }
    Object.defineProperty(CacheLimitChangedEvent.prototype, "name", {
        get: function () { return "Cache Limit Changed"; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CacheLimitChangedEvent.prototype, "uniqueName", {
        get: function () { return "LoganGerber-BindableObserver-CacheLimitChangedEvent"; },
        enumerable: false,
        configurable: true
    });
    return CacheLimitChangedEvent;
}(Event_1.Event));
exports.CacheLimitChangedEvent = CacheLimitChangedEvent;
