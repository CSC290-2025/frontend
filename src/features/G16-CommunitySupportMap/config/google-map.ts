import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import config from './env';

setOptions({ key: config.GOOGLE_MAPS_API_KEY });

type MapInit = {
  mapEl: HTMLElement;
  mapOptions: google.maps.MapOptions;
  markerOptions?: google.maps.marker.AdvancedMarkerElementOptions[];
  onMarkerClick?: (marker: google.maps.marker.AdvancedMarkerElement, index: number) => void
};

const initMapAndMarkers = async ({
  mapEl,
  mapOptions,
  markerOptions = [],
  onMarkerClick,
}: MapInit) => {
  try {
    const [{ Map }, { AdvancedMarkerElement }] = await Promise.all([
      importLibrary('maps') as Promise<google.maps.MapsLibrary>,
      importLibrary('marker') as Promise<google.maps.MarkerLibrary>,
    ]);

    const map = new Map(mapEl, mapOptions);

    const markers = markerOptions.map((options, index) => {
      const marker = new AdvancedMarkerElement({
        ...options,
        map: map,
      });

      // เพิ่ม click event ถ้ามี
      if (onMarkerClick) {
        marker.addListener('click', () => {
          onMarkerClick(marker, index);
        });
      }

      return marker;
    });

    return { map, markers };
  } catch (error) {
    console.error('Failed to initialize Google Map:', error);
    throw error;
  }
};
export default initMapAndMarkers;
