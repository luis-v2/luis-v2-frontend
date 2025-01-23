export interface DataPoint {
    timestamp: Date;
    [key: string]: number | any;
    interpolated: string[];
}