import { GoogleClustr } from './dist/module/index.js';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';

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

  GcPs.subscribe('click', (target) => {
    console.log('click', target);
  });
  GcPs.subscribe('hover', (target) => {
    console.log('hover', target);
  });
  GcPs.subscribe('count', (count) => {
    countContainer.innerHTML = `<strong>Current Point Count:</strong> ${count.toLocaleString(
      'en-US'
    )}`;
  });
  GcPs.subscribe('show', (collection) => {
    setTimeout(() => {
      const elems = document.querySelectorAll('.marker-point');

      Array.from(elems).forEach((elem) => {
        tippy(`#${elem.id}`, {
          content: 'My tooltip!',
          trigger: 'click',
          theme: 'light',
          arrow: true,
        });
      });
    }, 500);
  });
})();
