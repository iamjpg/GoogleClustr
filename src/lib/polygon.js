import convexHull from './convexHull';

export class Polygon {
  constructor() {}

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
