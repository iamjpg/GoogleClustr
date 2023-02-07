export class Helpers {
  constructor() {}

  clone(o) {
    const n = Array.isArray(o) ? [] : {};
    for (const i in o) {
      n[i] = typeof o[i] === 'object' ? clone(o[i]) : o[i];
    }
    return n;
  }

  returnClusterClassObject(length) {
    let classSize, offset;
    if (length >= 3) {
      classSize = 'large';
      offset = 25;
    } else if (length === 2) {
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
    const mapContainerElement = document.getElementById(mapContainer);
    const mapWidth = mapContainerElement.offsetWidth;
    const mapHeight = mapContainerElement.offsetHeight;
    const clusterPoints = [];

    for (let x = 0; x <= mapWidth; x += clusterRange) {
      for (let y = 0; y <= mapHeight; y += clusterRange) {
        const searched = this.searchQuadTree(
          quadtree,
          x,
          y,
          x + clusterRange,
          y + clusterRange
        );
        const centerPoint = searched.reduce(
          (prev, current) => [prev[0] + current[0], prev[1] + current[1]],
          [0, 0]
        );
        const avgX = centerPoint[0] / searched.length;
        const avgY = centerPoint[1] / searched.length;
        if (avgX && avgY) {
          clusterPoints.push([avgX, avgY, searched]);
        }
      }
    }

    return clusterPoints;
  }

  searchQuadTree(quadtree, x0, y0, x3, y3) {
    const validData = [];
    quadtree.visit((node, x1, y1, x2, y2) => {
      const point = node.point;
      if (point) {
        const isSelected =
          point[0] >= x0 && point[0] < x3 && point[1] >= y0 && point[1] < y3;
        if (isSelected) {
          validData.push(point);
        }
      }
      return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
    });
    return validData;
  }

  async getScript(source, callback) {
    const script = document.createElement('script');
    script.async = true;
    script.onload = () => {
      if (callback) setTimeout(callback, 0);
    };
    script.src = source;
    document.head.appendChild(script);
  }
}
