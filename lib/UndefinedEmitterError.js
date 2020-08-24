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
exports.UndefinedEmitterError = void 0;
/**
 * Error thrown when using functions that use events in a BindableObserver with
 * no internal EventEmitter set.
 */
var UndefinedEmitterError = /** @class */ (function (_super) {
    __extends(UndefinedEmitterError, _super);
    function UndefinedEmitterError() {
        var _this = _super.call(this, "Cannot call any event-using function on a BindableObserver with no InternalEmitter. Ensure an internal EventEmitter is set with BindableObserver.prototype.setInternalEmitter()") || this;
        Object.setPrototypeOf(_this, UndefinedEmitterError.prototype);
        return _this;
    }
    return UndefinedEmitterError;
}(Error));
exports.UndefinedEmitterError = UndefinedEmitterError;
