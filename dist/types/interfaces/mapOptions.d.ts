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
export interface EnumServiceItem {
    map: any;
    lat: number;
    lng: number;
    location: {
        latitude: number;
        longitude: number;
    };
}
export interface CollectionObject extends Array<EnumServiceItem> {
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
