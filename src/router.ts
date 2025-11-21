// Generouted, changes to this file will be overridden
 

import { components, hooks, utils } from '@generouted/react-router/client';

export type Path =
  | `/`
  | `/activity`
  | `/chat`
  | `/demo-tracking`
  | `/example`
  | `/example/:id`
  | `/hotLine`
  | `/notification`
  | `/notification/:id`
  | `/sos`
  | `/sos/:id`
  | `/sos/report`
  | `/sos/report/:id`;

export type Params = {
  '/example/:id': { id: string };
  '/notification/:id': { id: string };
  '/sos/:id': { id: string };
  '/sos/report/:id': { id: string };
};

export type ModalPath = never;

export const { Link, Navigate } = components<Path, Params>();
export const { useModals, useNavigate, useParams } = hooks<
  Path,
  Params,
  ModalPath
>();
export const { redirect } = utils<Path, Params>();
