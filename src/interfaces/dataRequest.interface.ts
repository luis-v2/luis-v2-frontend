export interface DataRequest {
    station: number;
    components: number[];
    startDate: Date;
    endDate: Date;
    average: number;
    interpolate: boolean;
    fileFormat: 'json' | 'csv';
}