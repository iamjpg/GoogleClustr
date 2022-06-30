import * as d3 from 'd3';
import { GOOGLE_KEY as gk } from './google-key';
import {
  MapOptions,
  CollectionObject,
  MapProjections,
  PointObject,
} from './interfaces/mapOptions';
import Overlay from './lib/overlay';
import { Helpers } from './lib/helpers';
import convexHull from './lib/convexHull';
import { Polygon } from './lib/polygon';

declare var google: any;

const helpers = new Helpers();
const polygon = new Polygon();

export class GoogleClustr {
  map: any;
  collection: CollectionObject;
  mapContainer: string = 'map';
  pointsRawLatLng: object;
  clusterRange: number = 200;
  threshold: number = 200;
  clusterRgba: string = '182, 0, 155, 1';
  clusterBorder: string = '5px solid #ccc';
  polygonStrokeColor: string = '#336699';
  polygonStrokeOpacity: string | number = '0.5';
  polygonStrokeWeight: string | number = '4';
  polygonFillColor: string = '#336699';
  polygonFillOpacity: string | number = '0.2';
  customPinHoverBehavior: boolean = false;
  customPinClickBehavior: boolean = false;
  overlay: any;
  mapContainerElem: HTMLElement;
  points: any;
  polygon: any;
  helpers: typeof Helpers;

  constructor(options: MapOptions) {
    for (const [key, value] of Object.entries(options)) {
      this[key] = value;
    }
    this.createOverlay();
    this.setMapEvents();
  }

  setMapEvents() {
    google.maps.event.addListener(this.map, 'idle', () => {
      if (this.collection) {
        polygon.removePolygon();
        this.removeElements();
        this.print();
      }
    });
    google.maps.event.addListener(this.map, 'dragstart', () => {
      polygon.removePolygon();
      this.removeElements();
    });
    google.maps.event.addListener(this.map, 'zoom_changed', () => {
      polygon.removePolygon();
      this.removeElements();
    });
  }

  setCollection(collection: CollectionObject) {
    this.collection = collection;
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
      if (document.querySelector('#GoogleClustrOverlay')) {
        clearInterval(overlayInterval);
        this.mapContainerElem = document.querySelector('#GoogleClustrOverlay');
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
      console.log('print points!');
    } else {
      this.paintClustersToCanvas(centerPoints);
    }
  }

  paintClustersToCanvas(points) {
    const frag = document.createDocumentFragment();

    // Loop over points assessing
    points.forEach((o: any[][], i: string) => {
      const clusterCount = o[2].length;

      const div = document.createElement('div');
      div.className =
        'point-cluster ' +
        helpers.returnClusterClassObject(clusterCount.toString().length)
          .classSize;
      div.style.backgroundColor = 'rgba(' + this.clusterRgba + ')';
      div.dataset.positionid = i;
      const latLngPointerArray = [];

      o[2].forEach(function (a, b) {
        latLngPointerArray.push(a[2]);
      });

      // START - Center cluster icon inside of Polygon.

      const polygonCoords: number[] = [];
      let pi: number;
      const mapProjections: MapProjections = helpers.returnMapProjections(
        this.map
      );

      latLngPointerArray.forEach((o) => {
        const pointer = this.collection[parseInt(o)];
        polygonCoords.push(new google.maps.LatLng(pointer.lat, pointer.lng));
      });

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

      const clusterLength = clusterCount.toString().length;

      div.style.left =
        x - helpers.returnClusterClassObject(clusterLength).offSet + 'px';
      div.style.top =
        y - helpers.returnClusterClassObject(clusterLength).offSet + 'px';

      // END - Center cluster icon inside of Polygon.

      div.dataset.latlngids = latLngPointerArray.join(',');
      div.innerHTML = clusterCount.toString();
      frag.appendChild(div);
      this.setClusterEvents(div);
    });

    this.mapContainerElem.appendChild(frag);
  }

  setClusterEvents(el: HTMLElement) {
    el.onmouseover = () => {
      polygon.showPolygon(el, this.collection, this.map);
    };
    el.onmouseout = () => {
      polygon.removePolygon();
    };
    el.onclick = () => {
      this.zoomToFit(el);
    };
  }

  zoomToFit(el: HTMLElement) {
    var self = this;
    var collectionIds = el.dataset.latlngids.split(',');
    var points = [];
    var points_alt = [];
    collectionIds.forEach(function (o, i) {
      var pointer = self.collection[parseInt(o)];
      points_alt.push({
        x: pointer.lat,
        y: pointer.lng,
      });
    });
    points_alt = convexHull(points_alt);
    points_alt.forEach(function (o, i) {
      points.push(new google.maps.LatLng(o.x, o.y));
    });
    var latlngbounds = new google.maps.LatLngBounds();
    for (var i = 0; i < points.length; i++) {
      latlngbounds.extend(points[i]);
    }

    requestAnimationFrame(function () {
      // self.map.fitBounds(latlngbounds);
      const center_lat = latlngbounds.getCenter().lat();
      const center_lng = latlngbounds.getCenter().lng();
      const current_zoom = self.map.getZoom();
      self.map.setCenter(new google.maps.LatLng(center_lat, center_lng));
      self.map.setZoom(current_zoom + 1);
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
}

export const GOOGLE_KEY = gk;
