import { Pipe } from "@angular/core";

export interface TableColumn {
    header: string;
    field: string;
    pipe: DynamicPipeInput;
}

export interface DynamicPipeInput {
    type: Pipe;
    args: any;
}