import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import uuid from 'short-uuid';
import MarkerWithLabel from './markerwithlabel';
import OverlappingMarkerSpiderfier from './spider-marker';

export class Point {
  // Constructor -> { options } object
  constructor(
    map,
    collection,
    customPinClickBehavior = false,
    customPinHoverBehavior = false
  ) {
    this.map = map;
    this.markers = [];
    this.collection = collection;
    this.oms = new OverlappingMarkerSpiderfier(this.map, {
      markersWontMove: true,
      markersWontHide: true,
      nearbyDistance: 10,
      keepSpiderfied: true,
      legWeight: 3,
      usualLegZIndex: 25000,
    });
  }

  print() {
    this.collection.forEach((o, i) => {
      const lat = o.lat || o.location.latitude;
      const lng = o.lng || o.location.longitude;
      const m = new MarkerWithLabel({
        id: `marker-${uuid.generate()}`,
        position: new google.maps.LatLng(lat, lng),
        map: self.map,
        hoverContent: o.hoverData || '',
        clickContent: o.clickData || '',
        labelContent: '',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 0,
        },
        draggable: false,
        labelAnchor: new google.maps.Point(10, 10),
        labelClass: 'marker-point',
        data: o.dataset,
      });

      this.markers.push(m);

      this.oms.addMarker(m);
    });
  }
}
