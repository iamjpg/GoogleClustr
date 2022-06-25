import { GOOGLE_KEY as gk } from './google-key';
export const GOOGLE_KEY = gk;

interface MapOptions {
  map: object;
  mapContainer: HTMLElement;
  cluserRange: number;
  threshhold: number;
  clusterRgba: string;
  clusterBorder: string;
  polygonStrokeColor: string;
  polygonStrokeOpacity: number;
  polygonStrokeWeight: number;
  polygonFillColor: string;
  polygonFillOpacity: number;
}

export const GoogleClustr = (options: MapOptions) => {
  console.log(options);
};
