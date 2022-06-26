import { GOOGLE_KEY as gk } from './google-key';
import { MapOptions } from './interfaces/mapOptions';

export class GoogleClustr {
  map: any;
  collection: Array<object>;

  constructor(options: MapOptions) {
    this.map = options.map;
  }

  setCollection(collection: Array<object>) {
    this.collection = collection;
  }

  print() {
    console.log('PRINT');
  }
}

export const GOOGLE_KEY = gk;
