# Google Clustr

Performant Google Maps Point Clustering.

## Demo

[https://google-clustr.vercel.app/](https://google-clustr.vercel.app/)

## Why

IMO, the current Google Maps Cluster library ([See library here](https://github.com/googlemaps/js-marker-clusterer)) is really inefficient when dealing with massive amounts of points as it creates a Google Maps Marker object for each point before clustering them.

## Install

### NPM

```
npm install google-clustr
```

### Yarn

```
yarn add google-clustr
```

## Example Implementation

### Import

```js
import { GoogleClustr } from 'google-clustr';
```

### Instantiation

```js
// IIFE
(async () => {
  // Map Options
  const mapOptions = {
    center: { lat: 34.05845309477056, lng: -118.03896754679423 },
    zoom: 8,
    clickableIcons: false,
    controlSize: 20,
  };

  // Instantiate Google Maps Object
  const map = new google.maps.Map(document.querySelector('#map'), mapOptions);

  // Instantiate GoogleClustr Object
  const gc = new GoogleClustr({
    map,
    mapContainer: 'map',
  });

  // Fetch School Data
  const schools = await fetch(
    'https://public.gis.lacounty.gov/public/rest/services/LACounty_Dynamic/LMS_Data_Public/MapServer/49/query?where=1%3D1&outFields=*&outSR=4326&f=json'
  ).then((response) => response.json());

  // Map data structure to array to be passed to the GoogleClustr object.
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
        lat: latitude, // Required
        lng: longitude, // Required
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

  // Set collection with array
  gc.setCollection(schoolsArr);
})();
```

## Instantiation Options

```js
const gc = new GoogleClustr({
  map: map, // Pass in your Google map intance.
  clusterRange: 300, // clusterRange is the pixel grid to cluster. Smaller = more clusters / Larger = less clusters.
  threshold: 300, // Threshold is the number of results before showing markers,
  clusterRgba: '255, 0, 102, .8', // Change the background of the cluster icon.
  clusterBorder: '5px solid #dcdcdc', // Change the border around the icon.
  polygonStrokeColor: '#0f0f0e', // Polygon stroke color.
  polygonStrokeOpacity: 0.5, // Polygon stroke opacity.
  polygonStrokeWeight: 4, // Polygon stroke weight.
  polygonFillColor: '#0f0f0e', // Polygom fill color.
  polygonFillOpacity: 0.2, // Polygon fill color.
});
```

## More Information

[Please visit the wiki](https://github.com/iamjpg/GoogleClustr/wiki)
