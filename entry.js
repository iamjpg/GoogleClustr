import { GoogleClustr } from './dist/module/index.js';

(async () => {
  const options = {
    center: { lat: 37.76487, lng: -122.41948 },
    zoom: 5,
    clickableIcons: false,
    controlSize: 20,
  };

  const map = (window.map = new google.maps.Map(
    document.getElementById('map'),
    options
  ));

  const json = await fetch(
    'https://cdn.jsdelivr.net/gh/iamjpg/GoogleClustr@latest/json/example.json'
  ).then((response) => response.json());

  const gc = new GoogleClustr({
    map,
    mapContainer: 'map',
    fitBounds: true,
  });

  gc.setCollection(json.data.result_list);

  const countContainer = document.querySelector('.countContainer');

  GoogleClustrPubSub.subscribe('click', (target) => {
    console.log('click', target);
  });
  GoogleClustrPubSub.subscribe('hover', (target) => {
    console.log('hover', target);
  });
  GoogleClustrPubSub.subscribe('count', (count) => {
    countContainer.innerHTML = `<strong>Current Point Count:</strong> ${count.toLocaleString(
      'en-US'
    )}`;
  });
})();
