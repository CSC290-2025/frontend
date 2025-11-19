// Generouted, changes to this file will be overridden
 

import { components, hooks, utils } from '@generouted/react-router/client';

export type Path =
  | `/`
  | `/Know-AI/courses`
  | `/Know-AI/exercises`
  | `/Know-AI/exercises/:level/:question`
  | `/example`
  | `/example/:id`;

export type Params = {
  '/Know-AI/exercises/:level/:question': { level: string; question: string };
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
