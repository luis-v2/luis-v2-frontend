import { StationComponent } from "./station-component.interface";

export interface Trend {
  component: StationComponent;
  previousValue: number;
  currentValue: number;
}
