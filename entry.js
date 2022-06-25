import { Loader, LoaderOptions } from 'google-maps';
import { GOOGLE_KEY, GoogleClustr } from './dist/module/index.js';

(async () => {
  const options = {
    center: { lat: 37.76487, lng: -122.41948 },
    zoom: 6,
    clickableIcons: false,
    controlSize: 20,
    disableDoubleClickZoom: true,
  };

  const loader = new Loader(GOOGLE_KEY);

  const google = await loader.load();
  const map = new google.maps.Map(document.getElementById('map'), options);

  GoogleClustr({
    map,
    message: 'lets do this.',
  });
})();
