/// <reference types="pubsub-js" />
import './scss/pointCluster.scss';
import { MapOptions, CollectionObject } from './interfaces/mapOptions';
import { Helpers } from './lib/helpers';
declare global {
    interface Window {
        d3: any;
        example: string;
        GcPs: PubSubJS.Base;
    }
}
export declare class GoogleClustr {
    map: any;
    collection: CollectionObject;
    mapContainer: string;
    clusterRange: number;
    threshold: number;
    clusterRgba: string;
    clusterBorder: string;
    clusterFontColor: string;
    polygonStrokeColor: string;
    polygonStrokeOpacity: string | number;
    polygonStrokeWeight: string | number;
    polygonFillColor: string;
    polygonFillOpacity: string | number;
    overlay: any;
    mapContainerElem: HTMLElement;
    points: any;
    polygon: any;
    helpers: typeof Helpers;
    constructor(options: MapOptions);
    setMapEvents(): void;
    setCollection(collection: CollectionObject): void;
    createOverlay(): void;
    print(): void;
    waitForMapContainer(callback: (mapContainerElem: HTMLElement) => void): void;
    removeElements(): void;
    paint(centerPoints: number[]): void;
    removeOverlay(): void;
    publishData(count: number, show?: any[]): void;
    paintClustersToCanvas(points: any[]): void;
    setClusterEvents(el: HTMLElement): void;
    zoomToFit(el: HTMLElement): void;
    getBoundsZoomLevel(bounds: any): number;
    checkIfLatLngInBounds(): import("./interfaces/mapOptions").EnumServiceItem[];
    showPolygon(el: HTMLElement, collection: CollectionObject, map: any): void;
    removePolygon(): void;
}
