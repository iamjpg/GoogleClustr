import { Loader } from 'google-maps';
import { GOOGLE_KEY, GoogleClustr } from './dist/module/index.js';

(async () => {
  const loader = new Loader(GOOGLE_KEY, {});

  const google = await loader.load();
  const map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 8,
  });

  GoogleClustr({
    message: 'lets do this.',
  });
})();
