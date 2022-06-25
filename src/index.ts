import { GOOGLE_KEY as gk } from './google-key';
import { MapOptions } from './interfaces/mapOptions';

export class GoogleClustr {
  collection: Array<object>;

  constructor(options: MapOptions) {
    console.log(options);
  }

  setCollection(collection: Array<object>) {
    this.collection = collection;
  }
}

export const GOOGLE_KEY = gk;
