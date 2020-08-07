"use strict";
exports.__esModule = true;
exports.Event = void 0;
var guid_typescript_1 = require("guid-typescript");
/**
 * Class that represents an event to be handled by an EventObserver.
 */
var Event = /** @class */ (function () {
    function Event(data) {
        this.id = guid_typescript_1.Guid.create();
        this.data = data;
    }
    return Event;
}());
exports.Event = Event;
