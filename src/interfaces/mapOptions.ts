export interface MapOptions {
  map: object; // Pass in your map intance.
  mapContainer: string;
  clusterRange: number; // clusterRange is the pixel grid to cluster. Smaller = more clusters / Larger = less clusters.
  threshold: number; // Threshold is the number of results before showing markers,
  clusterRgba: string; // Change the background of the cluster icon. RGBA only.
  clusterBorder: string; // Change the border around the icon. HEX only.
  polygonStrokeColor: string; // Polygon stroke color.
  polygonStrokeOpacity: number; // Polygon stroke opacity.
  polygonStrokeWeight: number; // Polygon stroke weight.
  polygonFillColor: string; // Polygom fill color.
  polygonFillOpacity: number; // Polygon fill color.
  customPinHoverBehavior: boolean; // If the user of the lib would rather not use popper and opt for their own hover behavior.
  customPinClickBehavior: boolean; // If the user of the lib would rather not use popper and opt for their own click behavior.
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

export interface CollectionObject extends Array<EnumServiceItem> {}

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
