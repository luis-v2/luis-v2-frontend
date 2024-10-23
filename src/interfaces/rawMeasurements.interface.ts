import { StationComponent } from "./station-component.interface";

export interface RawMeasurements {
    component: StationComponent;
    measurements: RawMeasurementsEntries;
}

export interface RawMeasurementsEntries {
    [timestamp: number]: number;
}