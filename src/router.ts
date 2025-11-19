// Generouted, changes to this file will be overridden
 

import { components, hooks, utils } from '@generouted/react-router/client';

export type Path =
  | `/`
  | `/clean-air/district-detail/:district`
  | `/clean-air/district-selection`
  | `/clean-air/overview/:district`
  | `/example`
  | `/example/:id`
  | `/weather-aqi`
  | `/weather-aqi/overview/:district`;

export type Params = {
  '/clean-air/district-detail/:district': { district: string };
  '/clean-air/overview/:district': { district: string };
  '/example/:id': { id: string };
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
