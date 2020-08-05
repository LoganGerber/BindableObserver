import { Guid } from "guid-typescript";

export abstract class Event {
    readonly id: Guid;
    readonly name: string | symbol;
    data: any;

    constructor(name?: string | symbol, data?: any) {
        this.id = Guid.create();
        this.name = name;
        this.data = data;
    }
}
