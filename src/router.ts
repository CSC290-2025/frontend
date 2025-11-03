// Generouted, changes to this file will be overridden
 

import { components, hooks, utils } from '@generouted/react-router/client';

export type Path =
  | `/`
  | `/AdminAddAPT`
  | `/AdminEditAPT`
  | `/AdminEditTenant`
  | `/AdminListedAPT`
  | `/AdminTenantInfo`
  | `/ApartmentBooking`
  | `/ApartmentDetails`
  | `/ApartmentHomepage`
  | `/ApartmentHomepage/:id`
  | `/ApartmentPayment`
  | `/MyRentedAPT`
  | `/example`
  | `/example/:id`;

export type Params = {
  '/ApartmentHomepage/:id': { id: string };
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
