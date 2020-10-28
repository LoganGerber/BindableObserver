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
exports.NonUniqueNameRegisteredError = void 0;
/**
 * Error thrown when an event is registered that does not have a unique name in
 * its uniqueName property
 */
var NonUniqueNameRegisteredError = /** @class */ (function (_super) {
    __extends(NonUniqueNameRegisteredError, _super);
    function NonUniqueNameRegisteredError(name, registeredEvent, duplicateEvent) {
        return _super.call(this, "Duplicate unique name found when registering new event.\nNon-Unique name: " + name + "\nExisting event: " + registeredEvent.name + "\nDuplicate event: " + duplicateEvent.name) || this;
    }
    return NonUniqueNameRegisteredError;
}(Error));
exports.NonUniqueNameRegisteredError = NonUniqueNameRegisteredError;
