export type MarkerOption = {
  position: google.maps.LatLngLiteral;
  title: string;
  markerTypeId?: number;
  markerTypeIconKey?: string;
};

export const MarkerIcon = {
  TrafficCone: `
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24" fill="none" stroke="#7b219f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-traffic-cone-icon lucide-traffic-cone"><path d="M16.05 10.966a5 2.5 0 0 1-8.1 0"/><path d="m16.923 14.049 4.48 2.04a1 1 0 0 1 .001 1.831l-8.574 3.9a2 2 0 0 1-1.66 0l-8.574-3.91a1 1 0 0 1 0-1.83l4.484-2.04"/><path d="M16.949 14.14a5 2.5 0 1 1-9.9 0L10.063 3.5a2 2 0 0 1 3.874 0z"/><path d="M9.194 6.57a5 2.5 0 0 0 5.61 0"/></svg>
`,
  Wind: `
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24" fill="none" stroke="#00762a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wind-icon lucide-wind"><path d="M12.8 19.6A2 2 0 1 0 14 16H2"/><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"/><path d="M9.8 4.4A2 2 0 1 1 11 8H2"/></svg>
`,
  Event: `
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24" fill="none" stroke="#aba200" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trophy-icon lucide-trophy"><path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"/><path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"/><path d="M18 9h1.5a1 1 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/><path d="M6 9H4.5a1 1 0 0 1 0-5H6"/></svg>
`,
  Emergency: `
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24" fill="none" stroke="#371a94" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-siren-icon lucide-siren"><path d="M7 18v-6a5 5 0 1 1 10 0v6"/><path d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z"/><path d="M21 12h1"/><path d="M18.5 4.5 18 5"/><path d="M2 12h1"/><path d="M12 2v1"/><path d="m4.929 4.929.707.707"/><path d="M12 12v6"/></svg>
`,
  DangerArea: `
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24" fill="none" stroke="#ff4013" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-alert-icon lucide-triangle-alert"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
`,
  Injured: `
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24" fill="none" stroke="#9a2083" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart-plus-icon lucide-heart-plus"><path d="m14.479 19.374-.971.939a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5a5.2 5.2 0 0 1-.219 1.49"/><path d="M15 15h6"/><path d="M18 12v6"/></svg>
`,
  Trash: `
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24" fill="none" stroke="#0433ff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2-icon lucide-trash-2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
`,
} as const;

export function getMarkerSvg(markerTypeId?: number): string | undefined {
  const id = Number(markerTypeId);

  switch (id) {
    case 1:
      return MarkerIcon.Wind; // Impure_air
    case 2:
      return MarkerIcon.TrafficCone; // Traffics
    case 3:
      return MarkerIcon.Event; // Events
    case 4:
      return MarkerIcon.Emergency; // Emergency_request
    case 5:
      return MarkerIcon.DangerArea; // Danger_area
    case 6:
      return MarkerIcon.Injured; // Injured_area
    case 7:
      return MarkerIcon.Trash; // Trash_area
    default:
      return undefined;
  }
}

const svgByDbKey: Record<string, string> = {
  Impure_air: MarkerIcon.Wind,
  Traffics: MarkerIcon.TrafficCone,
  Events: MarkerIcon.Event,
  Emergency_request: MarkerIcon.Emergency,
  Danger_area: MarkerIcon.DangerArea,
  Injured_area: MarkerIcon.Injured,
  Trash_area: MarkerIcon.Trash,
};

export function getMarkerSvgByKey(key?: string): string | undefined {
  if (!key) return undefined;
  return svgByDbKey[key];
}

export function getMarkerIconUrl(
  markerTypeIconKey?: string,
  markerTypeId?: number
): string | undefined {
  const svg =
    getMarkerSvgByKey(markerTypeIconKey) ?? getMarkerSvg(markerTypeId);
  if (!svg) return undefined;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
