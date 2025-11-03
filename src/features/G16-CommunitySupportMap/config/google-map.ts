import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import config from './env';

setOptions({ key: config.GOOGLE_MAPS_API_KEY });

type MapInit = {
  mapEl: HTMLElement;
  mapOptions: google.maps.MapOptions;
  markerOptions?: google.maps.marker.AdvancedMarkerElementOptions[];
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

    markerOptions.forEach((options) => {
      new AdvancedMarkerElement({
        ...options,
        map: map,
      });
    });

    return map;
  } catch (error) {
    console.error('Failed to initialize Google Map:', error);
    throw error;
  }
};
export default initMapAndMarkers;
