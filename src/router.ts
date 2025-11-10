// Generouted, changes to this file will be overridden
 

import { components, hooks, utils } from '@generouted/react-router/client';

export type Path =
  | `/`
  | `/example`
  | `/example/:id`
  | `/power-bi`
  | `/power-bi/summary/:category`
  | `/power-bi/summary/:category/:reportId`;

export type Params = {
  '/example/:id': { id: string };
  '/power-bi/summary/:category': { category: string };
  '/power-bi/summary/:category/:reportId': {
    category: string;
    reportId: string;
  };
};

export type ModalPath = never;

export const { Link, Navigate } = components<Path, Params>();
export const { useModals, useNavigate, useParams } = hooks<
  Path,
  Params,
  ModalPath
>();
export const { redirect } = utils<Path, Params>();
