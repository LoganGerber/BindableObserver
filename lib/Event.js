"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
var uuid_1 = require("uuid");
/**
 * Class that represents an event to be handled by an BindableObserver.
 */
var Event = /** @class */ (function () {
    function Event() {
        this.id = uuid_1.v1();
    }
    return Event;
}());
exports.Event = Event;
