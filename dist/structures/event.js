"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
class Event {
    event;
    run;
    constructor(event, run) {
        this.event = event;
        this.run = run;
    }
}
exports.Event = Event;
