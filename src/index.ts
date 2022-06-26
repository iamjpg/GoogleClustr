import * as d3 from 'd3';
import { GOOGLE_KEY as gk } from './google-key';
import { MapOptions, CollectionObject } from './interfaces/mapOptions';
import { Helpers } from './lib/helpers';

declare var google: any;

export class GoogleClustr {
  map: any;
  collection: CollectionObject;
  mapContainer: string;
  pointsRawLatLng: object;

  constructor(options: MapOptions) {
    this.map = options.map;
    this.mapContainer = options.mapContainer || 'map';
  }

  setCollection(collection: CollectionObject) {
    this.collection = collection;
  }

  print() {
    console.log('PRINT');
    // Set the projection, create quadtree, and get centerpoints.
    var projection = d3.geo.mercator();
    var path = d3.geo.path().projection(projection).pointRadius(1);
    var quadtree = d3.geom.quadtree()(this.returnPointsRaw());
    // var centerPoints = this.getCenterPoints(quadtree);
  }

  returnPointsRaw() {
    // Projection variables.
    var helpers = new Helpers();
    var mapProjections = helpers.returnMapProjections(this.map);

    this.pointsRawLatLng = [];

    return this.collection.map(function (o: CollectionObject, i: number) {
      // Create our point.
      var point = mapProjections.projection.fromLatLngToPoint(
        new google.maps.LatLng(o.lat, o.lng)
      );

      // Get the x/y based on the scale.
      var x = (point.x - mapProjections.bottomLeft.x) * mapProjections.scale;
      var y = (point.y - mapProjections.topRight.y) * mapProjections.scale;

      return [x, y, i];
    });
  }
}

export const GOOGLE_KEY = gk;
