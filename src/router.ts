// Generouted, changes to this file will be overridden

import { components, hooks, utils } from '@generouted/react-router/client';

export type Path =
  | `/`
  | `/volunteer/board`
  | `/volunteer/createpost`
  | `/volunteer/detail/:id`
  | `/volunteer/edit/:id`
  | `/volunteer/userjoin`;
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
  '/district-detail/:district': { district: string };
  '/example/:id': { id: string };
  '/volunteer/detail/:id': { id: string };
  '/volunteer/edit/:id': { id: string };
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
