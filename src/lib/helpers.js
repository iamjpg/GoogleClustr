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

  getCenterPoints(quadtree, mapContainer, clusterRange) {
    const clusterPoints = [];

    for (
      let x = 0;
      x <= document.getElementById(mapContainer).offsetWidth;
      x += clusterRange
    ) {
      for (
        let y = 0;
        y <= document.getElementById(mapContainer).offsetHeight;
        y += clusterRange
      ) {
        const searched = this.searchQuadTree(
          quadtree,
          x,
          y,
          x + clusterRange,
          y + clusterRange
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
}
