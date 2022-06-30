export class Helpers {
  constructor() {}

  clone(o) {
    const n = {}.toString.apply(o) == '[object Array]' ? [] : {};
    for (let i in o) n[i] = typeof o[i] == 'object' ? this.clone(o[i]) : o[i];
    return n;
  }

  returnClusterClassObject(length) {
    let classSize, offset;
    if (length >= 3) {
      classSize = 'large';
      offset = 25;
    } else if (length == 2) {
      classSize = 'medium';
      offset = 20;
    } else {
      classSize = 'small';
      offset = 15;
    }

    return {
      classSize: classSize,
      offSet: offset,
    };
  }

  returnMapProjections(map) {
    if (typeof map === 'undefined') return;

    const bounds = new google.maps.LatLngBounds(),
      projection = map.getProjection();

    return {
      bounds: bounds,
      projection: projection,
      topRight: projection.fromLatLngToPoint(map.getBounds().getNorthEast()),
      bottomLeft: projection.fromLatLngToPoint(map.getBounds().getSouthWest()),
      scale: Math.pow(2, map.getZoom()),
    };
  }

  returnPointsRaw(map, collection) {
    // Projection variables.
    const mapProjections = this.returnMapProjections(map);

    this.pointsRawLatLng = [];

    return collection.map(function (o, i) {
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
