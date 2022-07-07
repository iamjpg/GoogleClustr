export interface MapOptions {
    map: object;
    mapContainer: string;
    clusterRange: number;
    threshold: number;
    clusterRgba: string;
    clusterBorder: string;
    polygonStrokeColor: string;
    polygonStrokeOpacity: number;
    polygonStrokeWeight: number;
    polygonFillColor: string;
    polygonFillOpacity: number;
    customPinHoverBehavior: boolean;
    customPinClickBehavior: boolean;
}
export interface CollectionObject {
    map: any;
    lat: number;
    lng: number;
}
export interface MapProjections {
    scale: number;
    bounds: any;
    projection: any;
    bottomLeft: {
        [key: string]: number;
    };
    topRight: {
        [key: string]: number;
    };
}
export interface PointObject {
    x: number;
    y: number;
}
