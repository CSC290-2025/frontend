// Generouted, changes to this file will be overridden

import { components, hooks, utils } from '@generouted/react-router/client';

export type Path =
  | `/`
  | `/citizen/setting`
  | `/clean-air/district-detail/:district`
  | `/clean-air/district-selection`
  | `/clean-air/overview/:district`
  | `/example`
  | `/example/:id`
  | `/weather-aqi`
  | `/weather-aqi/overview/:district`;
  | `/Know-AI/:course`
  | `/Know-AI/:course/:id`
  | `/Know-AI/createCourse`
  | `/Know-AI/exercises`
  | `/Know-AI/exercises/:level/:question`
  | `/example`
  | `/example/:id`
  | `/weather`
  | `/weatherCity`
  | `/weatherMain`;
  | `/dashboard`
  | `/district-detail/:district`
  | `/district-selection`
  | `/example`
  | `/example/:id`
  | `/harm`
  | `/harm/:id`
  | `/healthcare`
  | `/map`
  | `/map/:id`
  | `/login`
  | `/power-bi`
  | `/power-bi/:type/:category`
  | `/power-bi/:type/:category/:id`
  | `/power-bi/create`
  | `/power-bi/edit/:id`
  | `/register`
  | `/event_hub`
  | `/event_hub/CreatePage`;
  | `/profile`

export type Params = {
  '/clean-air/district-detail/:district': { district: string };
  '/clean-air/overview/:district': { district: string };
  '/Know-AI/:course': { course: string };
  '/Know-AI/:course/:id': { course: string; id: string };
  '/Know-AI/exercises/:level/:question': { level: string; question: string };
  '/district-detail/:district': { district: string };
  '/example/:id': { id: string };
  '/weather-aqi/overview/:district': { district: string };
  '/harm/:id': { id: string };
  '/map/:id': { id: string };
  '/power-bi/:type/:category': { type: string; category: string };
  '/power-bi/:type/:category/:id': {
    type: string;
    category: string;
    id: string;
  };
  '/power-bi/edit/:id': { id: string };
};

export type ModalPath = never;

export const { Link, Navigate } = components<Path, Params>();
export const { useModals, useNavigate, useParams } = hooks<
  Path,
  Params,
  ModalPath
>();
export const { redirect } = utils<Path, Params>();
