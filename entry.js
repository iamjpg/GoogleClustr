import { GoogleClustr } from './dist/module/index.js';

(async () => {
  const options = {
    center: { lat: 42.231497689642886, lng: -120.84795105859376 },
    zoom: 9,
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

  json.data.result_list.forEach(function (o, i) {
    o.hoverData = o.lat + ' : ' + o.lng;
    o.dataset = [{ bar: 'boop' }];
    o.clickData =
      "You've clicked on this locaton:<br />" + o.lat + ' : ' + o.lng;
  });

  const gc = new GoogleClustr({
    map,
    mapContainer: 'map',
    fitBounds: true,
  });

  gc.setCollection(json.data.result_list);
})();
