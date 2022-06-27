import * as d3 from 'd3';
import { GOOGLE_KEY as gk } from './google-key';
import {
  MapOptions,
  CollectionObject,
  MapProjections,
  PointObject,
} from './interfaces/mapOptions';
import { Overlay } from './lib/overlay';
import { Helpers } from './lib/helpers';

declare var google: any;

export class GoogleClustr {
  map: any;
  collection: CollectionObject;
  mapContainer: string;
  pointsRawLatLng: object;
  clusterRange: number;
  threshold: number;
  clusterRgba: string;
  clusterBorder: string;
  polygonStrokeColor: string;
  polygonStrokeOpacity: string | number;
  polygonStrokeWeight: string | number;
  polygonFillColor: string;
  polygonFillOpacity: string | number;
  customPinHoverBehavior: boolean;
  customPinClickBehavior: boolean;
  overlay: any;
  mapContainerElem: HTMLElement;

  constructor(options: MapOptions) {
    this.map = options.map;
    this.mapContainer = options.mapContainer || 'map';
    this.clusterRange = options.clusterRange || 250;
    this.threshold = options.threshold || 200;
    this.clusterRgba = options.clusterRgba || '51, 102, 153, 0.8';
    this.clusterBorder = options.clusterBorder || '5px solid #ccc';
    this.polygonStrokeColor = options.polygonStrokeColor || '#336699';
    this.polygonStrokeOpacity = options.polygonStrokeOpacity || '0.5';
    this.polygonStrokeWeight = options.polygonStrokeWeight || '4';
    this.polygonFillColor = options.polygonFillColor || '#336699';
    this.polygonFillOpacity = options.polygonFillOpacity || '0.2';
    this.customPinHoverBehavior = options.customPinHoverBehavior || false;
    this.customPinClickBehavior = options.customPinClickBehavior || false;
    this.createOverlay();
  }

  setCollection(collection: CollectionObject) {
    this.collection = collection;
  }

  createOverlay() {
    if (this.overlay) {
      this.overlay.setMap(null);
    }
    this.overlay = new Overlay(this.map.getBounds());
    this.overlay.setMap(this.map);
  }

  print() {
    // create quadtree, and get centerpoints.
    const quadtree = d3.geom.quadtree()(this.returnPointsRaw());
    const centerPoints = this.getCenterPoints(quadtree);

    const overlayInterval = setInterval(() => {
      if (document.querySelector('#GoogleClustrOverlay')) {
        clearInterval(overlayInterval);
        this.mapContainerElem = document.querySelector('#GoogleClustrOverlay');
        this.paint(centerPoints);
      }
    }, 10);
  }

  paint(centerPoints) {
    if (this.checkIfLatLngInBounds().length <= this.threshold) {
      // this.overlay.setMap(null);
      // this.points = window.PointClusterPoints = new Point(
      //   this.map,
      //   this.checkIfLatLngInBounds(),
      //   this.customPinClickBehavior,
      //   this.customPinHoverBehavior
      // );
      // this.points.print();
      // PointPubSub.publish('Point.count', this.points.collection.length);
      // PointPubSub.publish('Point.show', this.points.collection);
      console.log('print points!');
    } else {
      // PointPubSub.publish(
      //   'Point.count',
      //   this.checkIfLatLngInBounds().length
      // );
      this.paintClustersToCanvas(centerPoints);
    }
  }

  paintClustersToCanvas(points) {
    const self = this;
    const frag = document.createDocumentFragment();
    const helpers = new Helpers();

    // Loop over points assessing
    points.forEach(function (o: any[][], i: string) {
      const clusterCount = o[2].length;

      const div = document.createElement('div');
      div.className =
        'point-cluster ' +
        helpers.returnClusterClassObject(clusterCount.toString().length)
          .classSize;
      div.style.backgroundColor = 'rgba(' + self.clusterRgba + ')';
      div.dataset.positionid = i;
      const latLngPointerArray = [];

      o[2].forEach(function (a, b) {
        latLngPointerArray.push(a[2]);
      });

      // START - Center cluster icon inside of Polygon.

      const polygonCoords: number[] = [];
      let pi: number;
      const mapProjections: MapProjections = helpers.returnMapProjections(
        self.map
      );

      latLngPointerArray.forEach(function (o, i) {
        const pointer = self.collection[parseInt(o)];
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

      div.style.left =
        x -
        helpers.returnClusterClassObject(clusterCount.toString().length)
          .offSet +
        'px';
      div.style.top =
        y -
        helpers.returnClusterClassObject(clusterCount.toString().length)
          .offSet +
        'px';

      // END - Center cluster icon inside of Polygon.

      div.dataset.latlngids = latLngPointerArray.join(',');
      div.innerHTML = clusterCount.toString();
      frag.appendChild(div);
      // self.setClusterEvents(div);
    });

    this.mapContainerElem.appendChild(frag);
  }

  checkIfLatLngInBounds() {
    const helpers = new Helpers();
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

  getCenterPoints(quadtree: any) {
    const clusterPoints = [];

    for (
      let x = 0;
      x <= document.getElementById(this.mapContainer).offsetWidth;
      x += this.clusterRange
    ) {
      for (
        let y = 0;
        y <= document.getElementById(this.mapContainer).offsetHeight;
        y += this.clusterRange
      ) {
        const searched = this.searchQuadTree(
          quadtree,
          x,
          y,
          x + this.clusterRange,
          y + this.clusterRange
        );

        const centerPoint = searched.reduce(
          function (prev, current) {
            return [prev[0] + current[0], prev[1] + current[1]];
          },
          [0, 0]
        );

        centerPoint[0] = centerPoint[0] / searched.length;
        centerPoint[1] = centerPoint[1] / searched.length;
        centerPoint.push(searched);

        if (centerPoint[0] && centerPoint[1]) {
          clusterPoints.push(centerPoint);
        }
      }
    }

    return clusterPoints;
  }

  searchQuadTree(quadtree, x0, y0, x3, y3) {
    const validData = [];
    quadtree.visit(function (node, x1, y1, x2, y2) {
      const p = node.point;
      if (p) {
        p.selected = p[0] >= x0 && p[0] < x3 && p[1] >= y0 && p[1] < y3;
        if (p.selected) {
          validData.push(p);
        }
      }
      return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
    });
    return validData;
  }

  returnPointsRaw() {
    // Projection variables.
    const helpers = new Helpers();
    const mapProjections = helpers.returnMapProjections(this.map);

    this.pointsRawLatLng = [];

    return this.collection.map(function (o: CollectionObject, i: number) {
      // Create our point.
      const point = mapProjections.projection.fromLatLngToPoint(
        new google.maps.LatLng(o.lat, o.lng)
      );

      // Get the x/y based on the scale.
      const x = (point.x - mapProjections.bottomLeft.x) * mapProjections.scale;
      const y = (point.y - mapProjections.topRight.y) * mapProjections.scale;

      return [x, y, i];
    });
  }
}

export const GOOGLE_KEY = gk;
