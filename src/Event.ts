import { Guid } from "guid-typescript";

export abstract class Event {
    readonly id: Guid;
    data: any;

    constructor(data?: any) {
        this.id = Guid.create();
        this.data = data;
    }

    abstract name(): string | symbol;
}
