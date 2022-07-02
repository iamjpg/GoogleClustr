import './css/pointCluster.css';
import * as d3 from 'd3';
import {
  MapOptions,
  CollectionObject,
  MapProjections,
  PointObject,
} from './interfaces/mapOptions';
import Overlay from './lib/overlay';
import { Helpers } from './lib/helpers';
import convexHull from './lib/convexHull';
import { Point } from './lib/Point';
import GcPs from 'vanilla-pubsub';

declare var google: any;
declare global {
  interface Window {
    example: string;
    GcPs: any;
  }
}

const helpers = new Helpers();
window.GcPs = GcPs;

export class GoogleClustr {
  map: any;
  collection: CollectionObject;
  mapContainer: string = 'map';
  pointsRawLatLng: object;
  clusterRange: number = 200;
  threshold: number = 200;
  clusterRgba: string = '182, 0, 155, 1';
  clusterBorder: string = '5px solid #ccc';
  polygonStrokeColor: string = '#222';
  polygonStrokeOpacity: string | number = '0.5';
  polygonStrokeWeight: string | number = '4';
  polygonFillColor: string = '#222';
  polygonFillOpacity: string | number = '0.3';
  customPinHoverBehavior: boolean = false;
  customPinClickBehavior: boolean = false;
  overlay: any;
  mapContainerElem: HTMLElement;
  points: any;
  polygon: any;
  helpers: typeof Helpers;
  fitBounds: boolean = true;

  constructor(options: MapOptions) {
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
    this.print();
  }

  createOverlay() {
    if (this.overlay) {
      this.overlay.setMap(null);
    }
    this.overlay = new Overlay(this.map);
    this.overlay.setMap(this.map);
  }

  print() {
    // create quadtree, and get centerpoints.
    const quadtree = d3.geom.quadtree()(
      helpers.returnPointsRaw(this.map, this.collection)
    );
    const centerPoints = helpers.getCenterPoints(
      quadtree,
      this.mapContainer,
      this.clusterRange
    );

    if (this.points) {
      this.points.remove();
    }

    const overlayInterval = setInterval(() => {
      this.mapContainerElem = document.querySelector('#GoogleClustrOverlay');
      if (this.mapContainerElem) {
        clearInterval(overlayInterval);
        this.paint(centerPoints);
      }
    }, 10);
  }

  removeElements() {
    var elements = document.getElementsByClassName('point-cluster');
    while (elements.length > 0) {
      elements[0].parentNode.removeChild(elements[0]);
    }
  }

  paint(centerPoints: number[]) {
    if (this.checkIfLatLngInBounds().length <= this.threshold) {
      this.overlay.setMap(null);
      this.points = new Point(
        this.map,
        this.checkIfLatLngInBounds(),
        this.customPinClickBehavior,
        this.customPinHoverBehavior
      );
      this.points.print();
      GcPs.publish('count', this.points.collection.length);
      GcPs.publish('show', this.points.collection);
    } else {
      this.paintClustersToCanvas(centerPoints);
      GcPs.publish('count', this.checkIfLatLngInBounds().length);
    }
  }

  paintClustersToCanvas(points: string | any[]) {
    const frag = document.createDocumentFragment();

    for (let i = 0; i < points.length; i++) {
      const clusterCount = points[i][2].length;
      const clusterLength = clusterCount.toString().length;

      const div = document.createElement('div');

      div.className =
        'point-cluster ' +
        helpers.returnClusterClassObject(clusterLength).classSize;

      div.style.backgroundColor = 'rgba(' + this.clusterRgba + ')';
      div.dataset.positionid = i.toString();

      const latLngPointerArray: number[] = [];

      for (let x = 0; x < points[i][2].length; x++) {
        latLngPointerArray.push(points[i][2][x][2]);
      }

      const polygonCoords: number[] = [];
      let pi: number;
      const mapProjections: MapProjections = helpers.returnMapProjections(
        this.map
      );

      for (let n = 0; n < latLngPointerArray.length; n++) {
        const pointer = this.collection[latLngPointerArray[n]];
        polygonCoords.push(new google.maps.LatLng(pointer.lat, pointer.lng));
      }

      for (pi = 0; pi < polygonCoords.length; pi++) {
        mapProjections.bounds.extend(polygonCoords[pi]);
      }

      const point: PointObject = mapProjections.projection.fromLatLngToPoint(
        new google.maps.LatLng(
          mapProjections.bounds.getCenter().lat(),
          mapProjections.bounds.getCenter().lng()
        )
      );

      // Get the x/y based on the scale.
      const x = (point.x - mapProjections.bottomLeft.x) * mapProjections.scale;
      const y = (point.y - mapProjections.topRight.y) * mapProjections.scale;

      div.style.left =
        x - helpers.returnClusterClassObject(clusterLength).offSet + 'px';
      div.style.top =
        y - helpers.returnClusterClassObject(clusterLength).offSet + 'px';

      div.dataset.latlngids = latLngPointerArray.join(',');
      div.innerHTML = clusterCount.toString();
      frag.appendChild(div);
      this.setClusterEvents(div);
    }

    this.mapContainerElem.appendChild(frag);
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
    const collectionIds = el.dataset.latlngids.split(',');
    const points = [];
    let points_alt = [];
    collectionIds.forEach((o, i) => {
      var pointer = this.collection[parseInt(o)];
      points_alt.push({
        x: pointer.lat,
        y: pointer.lng,
      });
    });
    points_alt = convexHull(points_alt);
    points_alt.forEach(function (o, i) {
      points.push(new google.maps.LatLng(o.x, o.y));
    });
    const latlngbounds = new google.maps.LatLngBounds();
    for (var i = 0; i < points.length; i++) {
      latlngbounds.extend(points[i]);
    }

    requestAnimationFrame(() => {
      if (this.fitBounds) {
        this.map.fitBounds(latlngbounds);
      } else {
        const center_lat = latlngbounds.getCenter().lat();
        const center_lng = latlngbounds.getCenter().lng();
        const current_zoom = this.map.getZoom();
        this.map.setCenter(new google.maps.LatLng(center_lat, center_lng));
        this.map.setZoom(current_zoom + 1);
      }
    });
  }

  checkIfLatLngInBounds() {
    const self = this;
    const arr = helpers.clone(this.collection);
    for (let i = 0; i < arr.length; ++i) {
      let lat = arr[i].lat || arr[i].location.latitude;
      let lng = arr[i].lng || arr[i].location.longitude;
      if (!self.map.getBounds().contains(new google.maps.LatLng(lat, lng))) {
        arr.splice(i, 1);
        --i; // Correct the index value
      }
    }
    return arr;
  }

  showPolygon(el, collection, map) {
    var collectionIds = el.dataset.latlngids.split(',');

    // Push the first lat/lng point to the end to close the polygon.
    collectionIds.push(collectionIds[0]);

    var points = [];

    for (let i = 0; i < collectionIds.length; i++) {
      const pointer = collection[collectionIds[i]];
      points.push({
        x: pointer.lat,
        y: pointer.lng,
      });
    }

    points = convexHull(points);

    points = points.map((item) => {
      return {
        lat: item.x,
        lng: item.y,
      };
    });

    this.polygon = new google.maps.Polygon({
      paths: points,
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
