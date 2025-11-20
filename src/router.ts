// Generouted, changes to this file will be overridden
 

import { components, hooks, utils } from '@generouted/react-router/client';

export type Path =
  | `/`
  | `/dashboard`
  | `/district-detail/:district`
  | `/district-selection`
  | `/example`
  | `/example/:id`
  | `/financial`
  | `/financial/insurance/:user_id`
  | `/financial/insurance/:user_id/info/:id`
  | `/financial/metro/:user_id`
  | `/financial/metro/:user_id/info/:id`
  | `/financial/topup`
  | `/healthcare`
  | `/login`
  | `/power-bi`
  | `/power-bi/:type/:category`
  | `/power-bi/:type/:category/:id`
  | `/power-bi/create`
  | `/power-bi/edit/:id`
  | `/register`
  | `/users`;

export type Params = {
  '/district-detail/:district': { district: string };
  '/example/:id': { id: string };
  '/financial/insurance/:user_id': { user_id: string };
  '/financial/insurance/:user_id/info/:id': { user_id: string; id: string };
  '/financial/metro/:user_id': { user_id: string };
  '/financial/metro/:user_id/info/:id': { user_id: string; id: string };
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
