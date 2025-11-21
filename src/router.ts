// Generouted, changes to this file will be overridden
 

import { components, hooks, utils } from '@generouted/react-router/client';

export type Path =
  | `/`
  | `/Know-AI/:course`
  | `/Know-AI/:course/:id`
  | `/Know-AI/createCourse`
  | `/Know-AI/exercises`
  | `/Know-AI/exercises/:level/:question`
  | `/activity`
  | `/chat`
  | `/clean-air/district-detail/:district`
  | `/clean-air/district-selection`
  | `/demo-tracking`
  | `/example`
  | `/example/:id`
  | `/harm`
  | `/harm/:id`
  | `/healthcare`
  | `/hotLine`
  | `/login`
  | `/map`
  | `/map/:id`
  | `/power-bi`
  | `/power-bi/:type/:category`
  | `/power-bi/:type/:category/:id`
  | `/power-bi/create`
  | `/power-bi/edit/:id`
  | `/register`
  | `/sos`
  | `/sos/:id`
  | `/sos/report`
  | `/sos/report/:id`
  | `/weather`
  | `/weather-aqi`
  | `/weather-aqi/overview/:district`
  | `/weatherCity`
  | `/weatherMain`;

export type Params = {
  '/Know-AI/:course': { course: string };
  '/Know-AI/:course/:id': { course: string; id: string };
  '/Know-AI/exercises/:level/:question': { level: string; question: string };
  '/clean-air/district-detail/:district': { district: string };
  '/example/:id': { id: string };
  '/harm/:id': { id: string };
  '/map/:id': { id: string };
  '/power-bi/:type/:category': { type: string; category: string };
  '/power-bi/:type/:category/:id': {
    type: string;
    category: string;
    id: string;
  };
  '/power-bi/edit/:id': { id: string };
  '/sos/:id': { id: string };
  '/sos/report/:id': { id: string };
  '/weather-aqi/overview/:district': { district: string };
};

export type ModalPath = never;

export const { Link, Navigate } = components<Path, Params>();
export const { useModals, useNavigate, useParams } = hooks<
  Path,
  Params,
  ModalPath
>();
export const { redirect } = utils<Path, Params>();
