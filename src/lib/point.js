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
    this.markerListeners = [];
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
      this.setOmsEvents();
      this.setHoverEvents(false);
    });
  }

  setOmsEvents() {
    const self = this;

    this.oms.addListener('click', function (marker, event) {
      // self.removePopper();
    });

    this.oms.addListener('spiderfy', function (markers, event) {
      self.removeUniversalPointHoverState();
      self.markers.forEach(function (marker) {
        marker.setOptions({
          zIndex: 1000,
          labelClass: marker.labelClass + ' fadePins',
        });
      });
      markers.forEach(function (marker) {
        self.removeListeners();
        self.setHoverEvents(true);
        marker.setOptions({
          zIndex: 20000,
          labelClass: marker.labelClass.replace(' fadePins', ''),
        });
      });
    });

    this.oms.addListener('unspiderfy', function (markers, event) {
      self.removeUniversalPointHoverState();
      self.markers.forEach(function (marker) {
        marker.setOptions({
          zIndex: 1000,
          labelClass: marker.labelClass.replace(' fadePins', ''),
        });
      });
      self.setHoverEvents(false);
    });
  }

  setHoverEvents(ignoreZindex = false) {
    if (this.customPinHoverBehavior) {
      return false;
    }

    const self = this;
    this.markers.forEach(function (marker) {
      let mouseOverListener = marker.addListener('mouseover', function (e) {
        let target = e.target || e.srcElement;
        let m = this;
        marker.setOptions({
          zIndex: 10000,
          labelClass: this.labelClass + ' PointHoverState',
        });

        if (!ignoreZindex) {
          this.setZIndex(5000);
        }
      });

      let mouseOutListener = marker.addListener('mouseout', function () {
        marker.setOptions({
          zIndex: 100,
          labelClass: this.labelClass.replace(' PointHoverState', ''),
        });

        if (!ignoreZindex) {
          this.setZIndex(1000);
        }
      });
      self.markerListeners.push(mouseOverListener);
      self.markerListeners.push(mouseOutListener);
    });
  }

  removeUniversalPointHoverState() {
    this.markers.forEach((o, i) => {
      o.setOptions({
        zIndex: 100,
        labelClass: 'marker-point',
      });
    });
  }

  // Remove listeners.
  removeListeners() {
    for (let i = 0; i < this.markerListeners.length; i++) {
      google.maps.event.removeListener(this.markerListeners[i]);
    }
    this.markerListeners = [];
  }

  // Remove method to remove everything.
  remove() {
    this.removeListeners();
    for (var i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(null);
    }
  }
}
