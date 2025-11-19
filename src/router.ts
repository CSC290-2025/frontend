// Generouted, changes to this file will be overridden

import { components, hooks, utils } from '@generouted/react-router/client';

export type Path =
  | `/`
  | `/Know-AI/:course`
  | `/Know-AI/:course/:id`
  | `/Know-AI/createCourse`
  | `/dashboard`
  | `/district-detail/:district`
  | `/district-selection`
  | `/example`
  | `/example/:id`
  | `/healthcare`
  | `/power-bi`
  | `/power-bi/:type/:category`
  | `/power-bi/:type/:category/:id`
  | `/power-bi/create`
  | `/power-bi/edit/:id`;

export type Params = {
  '/Know-AI/:course': { course: string };
  '/Know-AI/:course/:id': { course: string; id: string };
  '/district-detail/:district': { district: string };
  '/example/:id': { id: string };
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
