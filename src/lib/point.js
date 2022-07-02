import debounce from 'lodash.debounce';
import uuid from 'short-uuid';
import MarkerWithLabel from './markerwithlabel';
import OverlappingMarkerSpiderfier from './spider-marker';

export class Point {
  constructor(map, collection) {
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

  publishEvent = debounce(
    (eventStr, data) => {
      GcPs.publish(eventStr, data);
    },
    250,
    {
      leading: true,
      trailing: false,
    }
  );

  setOmsEvents() {
    const self = this;

    this.oms.addListener('spiderfy', function (markers) {
      self.publishEvent('spiderfy', markers);
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
      self.publishEvent('unspiderfy', markers);
      self.removeUniversalPointHoverState();
      self.markers.forEach(function (marker) {
        marker.setOptions({
          zIndex: 1000,
          labelClass: marker.labelClass.replace(' fadePins', ''),
        });
      });
      self.removeListeners();
      self.setHoverEvents(false);
    });
  }

  setHoverEvents = debounce((ignoreZindex = false) => {
    const self = this;
    this.setClickEvents();
    this.markers.forEach(function (marker) {
      let mouseOverListener = marker.addListener(
        'mouseover',
        function ({ target }) {
          GcPs.publish('hover', target);
          marker.setOptions({
            zIndex: 10000,
            labelClass: this.labelClass + ' PointHoverState',
          });

          if (!ignoreZindex) {
            this.setZIndex(5000);
          }
        }
      );

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
  }, 250);

  setClickEvents = debounce(() => {
    const self = this;
    this.markers.forEach(function (marker) {
      let mouseClickListener = marker.addListener(
        'click',
        function ({ target }) {
          GcPs.publish('click', target);
        }
      );
      self.markerListeners.push(mouseClickListener);
    });
  }, 250);

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
