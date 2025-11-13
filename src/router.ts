// Generouted, changes to this file will be overridden
 

import { components, hooks, utils } from '@generouted/react-router/client';

export type Path =
  | `/`
  | `/example`
  | `/example/:id`
  | `/financial`
  | `/financial/metro/:user_id`
  | `/financial/metro/:user_id/info/:id`
  | `/users`;

export type Params = {
  '/example/:id': { id: string };
  '/financial/metro/:user_id': { user_id: string };
  '/financial/metro/:user_id/info/:id': { user_id: string; id: string };
};

export type ModalPath = never;

export const { Link, Navigate } = components<Path, Params>();
export const { useModals, useNavigate, useParams } = hooks<
  Path,
  Params,
  ModalPath
>();
export const { redirect } = utils<Path, Params>();
