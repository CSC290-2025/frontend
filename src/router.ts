// Generouted, changes to this file will be overridden

import { components, hooks, utils } from '@generouted/react-router/client';

export type Path =
  | `/`
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
  | `/healthcare`
  | `/login`
  | `/power-bi`
  | `/power-bi/:type/:category`
  | `/power-bi/:type/:category/:id`
  | `/power-bi/create`
  | `/power-bi/edit/:id`
  | `/register`;

export type Params = {
  '/example/:id': { id: string };
};

export type ModalPath = never;

export const { Link, Navigate } = components<Path, Params>();
export const { useModals, useNavigate, useParams } = hooks<
  Path,
  Params,
  ModalPath
>();
export const { redirect } = utils<Path, Params>();
