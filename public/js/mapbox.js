/*eslint-disable*/
console.log('Mapbox script loaded');

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiZGllZ28tbXAtYm94IiwiYSI6ImNtYTZ4aXlsMDB3bjIya3BvOHZla3I1MjAifQ.b6616SGWco2YPQ-a5FUb0A';
  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/diego-mp-box/cma7ji7xl006o01sbaxyrh1vy', // style URL
    // center: [-74.5, 40], // starting position [lng, lat]
    // zoom: 10, // starting zoom
    // interactive: false,
    scrollZoom: false, // disable scroll zoom
    // dragPan: false, // disable drag pan
    // dragRotate: false, // disable drag rotate
    // pitchWithRotate: false, // disable pitch with rotate
    // boxZoom: false, // disable box zoom
    //desactivar zoom al hacer doble click
    doubleClickZoom: false, // disable double click zoom
  });

  //esto linea lo que hace es que el mapa se ajuste a los limites de los marcadores
  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker to map
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30, // this is the distance from the marker to the popup
      //opciones de la ventana emergente
      // closeButton: false, // no close button
      // closeOnClick: false, // no close on click
    })
      .setLngLat(loc.coordinates) // this is the location of the popup
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`) // this is the content of the popup
      .addTo(map); // this adds the popup to the map

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  // Fit map to bounds
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
