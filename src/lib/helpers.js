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
}
