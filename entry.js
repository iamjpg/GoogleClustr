import { GoogleClustr } from './src/index.ts';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';

(async () => {
  const options = {
    // center: { lat: 37.76487, lng: -122.41948 },
    // zoom: 5,
    center: { lat: 35.482770252450926, lng: -120.8537 },
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
    const { lat, lng } = o;
    o.dataset = [{ lat }, { lng }];
  });

  const gc = new GoogleClustr({
    map,
    mapContainer: 'map',
    fitBounds: true,
  });

  gc.setCollection(json.data.result_list);

  const countContainer = document.querySelector('.countContainer');

  let tippyInstances = [];
  let tippyClickInstances = [];

  GcPs.subscribe('click', (target) => {
    const tippyClickInstance = tippy(`#${target.id}`, {
      content: "I'm triggered by a click event!",
      theme: 'light',
      arrow: true,
      trigger: 'click',
      showOnCreate: true,
      interactive: true,
    });

    tippyClickInstances.push(tippyClickInstance);
  });
  GcPs.subscribe('hover', (target) => {
    if (!tippyInstances.includes(target.id)) {
      const { dataset } = target;
      tippy(`#${target.id}`, {
        content: `Hovering<br /><strong>lat:</strong> ${dataset.lat}, <strong>lng:</strong> ${dataset.lng}`,
        theme: 'light',
        arrow: true,
        showOnCreate: true,
        allowHTML: true,
      });
    }

    tippyInstances.push(target.id);
  });
  GcPs.subscribe('count', (count) => {
    countContainer.innerHTML = `<strong>Current Point Count:</strong> ${count.toLocaleString(
      'en-US'
    )}`;
  });
  GcPs.subscribe('show', (collection) => {});
  GcPs.subscribe('spiderfy', (markers) => {});
  GcPs.subscribe('unspiderfy', (markers) => {
    tippyClickInstances.forEach((instance) => {
      instance[0].destroy();
    });
    tippyClickInstances = [];
  });
})();
