"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
var guid_typescript_1 = require("guid-typescript");
/**
 * Class that represents an event to be handled by an BindableObserver.
 */
var Event = /** @class */ (function () {
    function Event() {
        this.id = guid_typescript_1.Guid.create();
    }
    return Event;
}());
exports.Event = Event;
