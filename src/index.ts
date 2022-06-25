import { GOOGLE_KEY as gk } from './google-key';
import { MapOptions } from './interfaces/mapOptions';
import { Overlay } from './lib/overlay';

export class GoogleClustr {
  map: any;
  collection: Array<object>;
  overlay: any;

  constructor(options: MapOptions) {
    this.map = options.map;
  }

  setCollection(collection: Array<object>) {
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
    this.createOverlay();
  }
}

export const GOOGLE_KEY = gk;
