import { GoogleClustr } from './index.js';

(async () => {
  const options = {
    center: { lat: 34.05845309477056, lng: -118.03896754679423 },
    zoom: 8,
    clickableIcons: false,
    controlSize: 20,
  };

  const map = (window.map = new google.maps.Map(
    document.getElementById('map'),
    options
  ));

  const gc = new GoogleClustr({
    map,
    mapContainer: 'map',
  });

  const schools = await fetch(
    'https://public.gis.lacounty.gov/public/rest/services/LACounty_Dynamic/LMS_Data_Public/MapServer/49/query?where=1%3D1&outFields=*&outSR=4326&f=json'
  ).then((response) => response.json());

  const schoolsArr = schools.features.map(
    ({
      attributes: {
        latitude,
        longitude,
        OBJECTID,
        Name,
        addrln1,
        city,
        zip,
        url,
        phones,
      },
    }) => {
      return {
        lat: latitude,
        lng: longitude,
        id: OBJECTID,
        dataset: [
          { name: Name },
          { address: addrln1 },
          { city },
          { zip },
          { url: url ? url : 'Not Available' },
          { phones },
        ],
      };
    }
  );

  gc.setCollection(schoolsArr);

  const countContainer = document.querySelector('.count');

  let tippyInstances = [];
  let tippyClickInstances = [];

  GcPs.subscribe('click', (msg, target) => {
    const { dataset } = target;

    const htmlStr = `
      <strong>${dataset.name}</strong><br />
      ${dataset.address}<br />
      ${dataset.city}, ${dataset.zip}<br /><br />
      <strong>Phones:</strong> ${dataset.phones}<br />
      <strong>URL:</strong> ${dataset.url}
    `;

    const tippyClickInstance = tippy(`#${target.id}`, {
      content: htmlStr,
      theme: 'light',
      arrow: true,
      trigger: 'click',
      showOnCreate: true,
      interactive: true,
      allowHTML: true,
    });

    tippyClickInstances.push(tippyClickInstance);
  });
  GcPs.subscribe('hover', (msg, target) => {
    if (!tippyInstances.includes(target.id)) {
      const { dataset } = target;
      tippy(`#${target.id}`, {
        content: `Hovering over ${dataset.name}`,
        theme: 'light',
        arrow: true,
        showOnCreate: true,
        allowHTML: true,
      });
    }

    tippyInstances.push(target.id);
  });
  GcPs.subscribe('count', (msg, count) => {
    countContainer.innerHTML = `${count.toLocaleString('en-US')}`;
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
