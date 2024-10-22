import { StationComponent } from "./station-component.interface";

export interface Station {
    id: number;
    name: string;
    availableComponents?: StationComponent[];
}