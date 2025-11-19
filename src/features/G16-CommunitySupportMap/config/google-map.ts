import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

import config from './env';

setOptions({ key: config.GOOGLE_MAPS_API_KEY });

type MapInit = {
  mapEl: HTMLElement;
  mapOptions: google.maps.MapOptions;
  markerOptions?: {
    position: google.maps.LatLngLiteral;
    title: string;
  }[];
};

const initMapAndMarkers = async ({
  mapEl,
  mapOptions,
  markerOptions = [],
}: MapInit) => {
  try {
    const [{ Map }, { AdvancedMarkerElement }] = await Promise.all([
      importLibrary('maps') as Promise<google.maps.MapsLibrary>,
      importLibrary('marker') as Promise<google.maps.MarkerLibrary>,
    ]);

    const map = new Map(mapEl, mapOptions);

    // create info window
    const infoWindow = new google.maps.InfoWindow();

    markerOptions.forEach((opt) => {
      const marker = new AdvancedMarkerElement({
        position: opt.position,
        title: opt.title,
        map: map,
      });

      // when click marker show popup
      marker.addListener('click', () => {
        infoWindow.close();

        const titleWithoutConfident = (opt.title ?? '')
          .replace(/\(\d+%\)/, '')
          .trim();
        // const raw = opt.title ?? "";
        // const typeOnly = raw.split(":")[1]
        //                   ?.replace(/\(.*\)/, "");

        infoWindow.setContent(`
          <div style="min-width:180px; font-size: 14px">
            <strong>${titleWithoutConfident}</strong><br />
            Lat: ${opt.position.lat}<br />
            Lng: ${opt.position.lng}
          </div>
        `);
        infoWindow.open(map, marker);
      });
    });

    return map;
  } catch (error) {
    console.error('Failed to initialize Google Map:', error);
    throw error;
  }
};

export default initMapAndMarkers;
