interface MapOptions {
    map: object;
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
export class GoogleClustr {
    map: any;
    collection: Array<object>;
    overlay: any;
    constructor(options: MapOptions);
    setCollection(collection: Array<object>): void;
    createOverlay(): void;
    print(): void;
}
export const GOOGLE_KEY = "3&key=AIzaSyBlBF1pMOPOmycKD-NyTfyyD7Tdo60E6XU";

//# sourceMappingURL=types.d.ts.map
