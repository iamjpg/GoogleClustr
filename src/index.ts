import './scss/pointCluster.scss';
import {
  MapOptions,
  CollectionObject,
  MapProjections,
  PointObject,
} from './interfaces/mapOptions';
import Overlay from './lib/overlay';
import { Helpers } from './lib/helpers';
import { convexHull } from './lib/convexHull';
import { Point } from './lib/point';
import GcPs from 'pubsub-js';

declare var google: any;
declare global {
  interface Window {
    d3: any;
    example: string;
    GcPs: PubSubJS.Base;
  }
}

const helpers = new Helpers();
window.GcPs = GcPs;

export class GoogleClustr {
  map: any;
  collection!: CollectionObject;
  mapContainer: string = 'map';
  clusterRange: number = 200;
  threshold: number = 200;
  clusterRgba: string = '34, 34, 34, 1';
  clusterBorder: string = '5px solid #ccc';
  clusterFontColor: string = '#FBBDC7';
  polygonStrokeColor: string = '#222';
  polygonStrokeOpacity: string | number = '0.5';
  polygonStrokeWeight: string | number = '4';
  polygonFillColor: string = '#222';
  polygonFillOpacity: string | number = '0.3';
  overlay: any;
  mapContainerElem!: HTMLElement;
  points: any;
  polygon: any;
  helpers: typeof Helpers;

  constructor(options: MapOptions) {
    helpers.getScript('https://d3js.org/d3.v3.min.js');
    for (let key in options) {
      this[key] = options[key];
    }

    this.createOverlay();
    this.setMapEvents();
  }

  setMapEvents() {
    google.maps.event.addListener(this.map, 'idle', () => {
      if (this.collection) {
        this.createOverlay();
        this.removePolygon();
        this.removeElements();
        this.print();
      }
    });
    google.maps.event.addListener(this.map, 'dragstart', () => {
      this.removePolygon();
      this.removeElements();
    });
    google.maps.event.addListener(this.map, 'zoom_changed', () => {
      this.removePolygon();
      this.removeElements();
    });
  }

  setCollection(collection: CollectionObject) {
    this.collection = collection;
    const d3Int = setInterval(() => {
      if (window.d3) {
        clearInterval(d3Int);
        this.print();
      }
    }, 10);
  }

  createOverlay() {
    if (this.overlay) {
      this.overlay.setMap(null);
    }
    this.overlay = new Overlay(this.map);
    this.overlay.setMap(this.map);
  }

  print() {
    const pointsRaw = helpers.returnPointsRaw(this.map, this.collection);
    const quadtree = window.d3.geom.quadtree()(pointsRaw);
    const centerPoints = helpers.getCenterPoints(
      quadtree,
      this.mapContainer,
      this.clusterRange
    );

    this.points?.remove();

    this.waitForMapContainer((mapContainerElem) => {
      this.paint(centerPoints);
    });
  }

  waitForMapContainer(callback: (mapContainerElem: HTMLElement) => void) {
    this.mapContainerElem = document.querySelector(
      '#GoogleClustrOverlay'
    ) as HTMLElement;
    if (this.mapContainerElem) {
      callback(this.mapContainerElem);
    } else {
      setTimeout(() => this.waitForMapContainer(callback), 10);
    }
  }

  removeElements() {
    var elements = document.getElementsByClassName('point-cluster');
    while (elements.length > 0) {
      const element = elements[0] as HTMLElement;
      element?.parentNode?.removeChild(elements[0]);
    }
  }

  paint(centerPoints: number[]) {
    const pointsInBounds = this.checkIfLatLngInBounds();

    if (pointsInBounds.length <= this.threshold) {
      this.removeOverlay();
      this.points = new Point(this.map, pointsInBounds);
      this.points.print();
      this.publishData(pointsInBounds.length, pointsInBounds);
    } else {
      this.paintClustersToCanvas(centerPoints);
      this.publishData(pointsInBounds.length);
    }
  }

  removeOverlay() {
    this.overlay.setMap(null);
  }

  publishData(count: number, show?: any[]) {
    GcPs.publish('count', count);
    if (show) {
      GcPs.publish('show', show);
    }
  }

  paintClustersToCanvas(points: any[]) {
    const fragment = document.createDocumentFragment();

    points.forEach((point, i) => {
      const clusterCount = point[2].length;
      const clusterLength = clusterCount.toString().length;

      const div = document.createElement('div');
      div.className = `point-cluster ${
        helpers.returnClusterClassObject(clusterLength).classSize
      }`;
      div.style.backgroundColor = `rgba(${this.clusterRgba})`;
      div.style.color = this.clusterFontColor;
      div.dataset.positionid = i.toString();

      const latLngPointerArray = point[2].map((p) => p[2]);
      const polygonCoords = latLngPointerArray.map((idx) => {
        const pointer = this.collection[idx];
        return new google.maps.LatLng(pointer.lat, pointer.lng);
      });

      const mapProjections = helpers.returnMapProjections(this.map);
      polygonCoords.forEach((coord) => {
        mapProjections.bounds.extend(coord);
      });

      const centerPoint = mapProjections.projection.fromLatLngToPoint(
        mapProjections.bounds.getCenter()
      );

      const x =
        (centerPoint.x - mapProjections.bottomLeft.x) * mapProjections.scale;
      const y =
        (centerPoint.y - mapProjections.topRight.y) * mapProjections.scale;

      div.style.left = `${
        x - helpers.returnClusterClassObject(clusterLength).offSet
      }px`;
      div.style.top = `${
        y - helpers.returnClusterClassObject(clusterLength).offSet
      }px`;
      div.dataset.latlngids = latLngPointerArray.join(',');
      div.innerHTML = clusterCount.toString();

      fragment.appendChild(div);
      this.setClusterEvents(div);
    });

    this.mapContainerElem.appendChild(fragment);
  }

  setClusterEvents(el: HTMLElement) {
    el.onmouseover = () => {
      this.showPolygon(el, this.collection, this.map);
    };
    el.onmouseout = () => {
      this.removePolygon();
    };
    el.onclick = () => {
      this.zoomToFit(el);
    };
  }

  zoomToFit(el: HTMLElement) {
    const collectionIds = el?.dataset?.latlngids?.split(',');
    if (!collectionIds) return;

    const latlngs = collectionIds.map((id) => {
      const pointer = this.collection[parseInt(id)];
      return new google.maps.LatLng(pointer.lat, pointer.lng);
    });

    const bounds = new google.maps.LatLngBounds();
    latlngs.forEach((latlng) => bounds.extend(latlng));

    const center = bounds.getCenter();
    const zoom = this.getBoundsZoomLevel(bounds);

    requestAnimationFrame(() => {
      this.map.setCenter(center);
      this.map.setZoom(zoom);
    });
  }

  getBoundsZoomLevel(bounds: any) {
    const WORLD_DIM = { height: 256, width: 256 };
    const ZOOM_MAX = 22;

    const mapEl = document.querySelector(
      `#${this.mapContainer}`
    ) as HTMLElement;
    const mapDim = { height: mapEl.clientHeight, width: mapEl.clientWidth };

    function latRad(lat: number) {
      const sin = Math.sin((lat * Math.PI) / 180);
      const radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
      return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
    }

    function zoom(mapPx: number, worldPx: number, fraction: number) {
      return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
    }

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    const latFraction = (latRad(ne.lat()) - latRad(sw.lat())) / Math.PI;

    const lngDiff = ne.lng() - sw.lng();
    const lngFraction = (lngDiff < 0 ? lngDiff + 360 : lngDiff) / 360;

    const latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction);
    const lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction);

    return Math.min(latZoom, lngZoom, ZOOM_MAX);
  }

  checkIfLatLngInBounds() {
    const collection = this.collection.filter((item) => {
      const lat = item.lat || item.location.latitude;
      const lng = item.lng || item.location.longitude;
      const latLng = new google.maps.LatLng(lat, lng);
      return this.map.getBounds().contains(latLng);
    });

    return collection;
  }

  showPolygon(el: HTMLElement, collection: CollectionObject, map: any) {
    const collectionIds = (el?.dataset?.latlngids?.split(',') || []).concat(
      el?.dataset?.latlngids?.split(',')[0] as any
    );
    const points = collectionIds.map((id) => ({
      x: collection[id].lat,
      y: collection[id].lng,
    }));
    const convexHullPoints = convexHull(points);
    const googleMapPoints = convexHullPoints.map((item) => ({
      lat: item.x,
      lng: item.y,
    }));

    this.polygon = new google.maps.Polygon({
      paths: googleMapPoints,
      strokeColor: this.polygonStrokeColor,
      strokeOpacity: this.polygonStrokeOpacity,
      strokeWeight: this.polygonStrokeWeight,
      fillColor: this.polygonFillColor,
      fillOpacity: this.polygonFillOpacity,
    });

    this.polygon.setMap(map);
  }

  removePolygon() {
    if (this.polygon) {
      this.polygon.setMap(null);
    }
  }
}
