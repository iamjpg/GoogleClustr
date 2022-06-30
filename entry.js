import { GoogleClustr } from './dist/module/index.js';

(async () => {
  const options = {
    center: { lat: 37.76487, lng: -122.41948 },
    zoom: 6,
    clickableIcons: false,
    controlSize: 20,
  };

  const map = new google.maps.Map(document.getElementById('map'), options);

  const json = await fetch(
    'https://cdn.jsdelivr.net/gh/iamjpg/GoogleClustr@latest/json/example.json'
  ).then((response) => response.json());

  const gc = new GoogleClustr({
    map,
    mapContainer: 'map',
    fitBounds: true,
  });

  gc.setCollection(json.data.result_list);
})();
