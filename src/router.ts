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
  | `/Know-AI/:course`
  | `/Know-AI/:course/:id`
  | `/Know-AI/createCourse`
  | `/Know-AI/exercises`
  | `/Know-AI/exercises/:level/:question`
  | `/clean-air/district-detail/:district`
  | `/clean-air/district-selection`
  | `/example`
  | `/MyRentedAPT`
  | `/activity`
  | `/chat`
  | `/citizen/setting`
  | `/clean-air/district-detail/:district`
  | `/clean-air/district-selection`
  | `/demo-tracking`
  | `/event_hub`
  | `/event_hub/CreatePage`
  | `/example/:id`
  | `/financial`
  | `/financial/insurance/:user_id`
  | `/financial/insurance/:user_id/info/:id`
  | `/financial/metro/:user_id`
  | `/financial/metro/:user_id/info/:id`
  | `/financial/topup`
  | `/freecycle`
  | `/freecycle/items/:id`
  | `/freecycle/items/edit/:id`
  | `/freecycle/my-items`
  | `/freecycle/post-event`
  | `/freecycle/post-item`
  | `/harm`
  | `/harm/:id`
  | `/healthcare`
  | `/hotLine`
  | `/login`
  | `/map`
  | `/map/:id`
  | `/power-bi`
  | `/power-bi/:type/:category`
  | `/power-bi/:type/:category/:id`
  | `/power-bi/create`
  | `/power-bi/edit/:id`
  | `/register`
  | `/profile`
  | `/public_transportation`
  | `/register`
  | `/sos`
  | `/sos/:id`
  | `/sos/report`
  | `/sos/report/:id`
  | `/traffic`
  | `/traffic/AddLight`
  | `/traffic/Manual-Manage`
  | `/traffic/admin`
  | `/traffic/control`
  | `/traffic/mock`
  | `/traffic/test`
  | `/users`
  | `/waste-management`
  | `/weather`
  | `/weather-aqi`
  | `/weather-aqi/overview/:district`
  | `/weatherCity`
  | `/weatherMain`;

export type Params = {
  '/ApartmentHomepage/:id': { id: string };
  '/Know-AI/:course': { course: string };
  '/Know-AI/:course/:id': { course: string; id: string };
  '/Know-AI/exercises/:level/:question': { level: string; question: string };
  '/clean-air/district-detail/:district': { district: string };
  '/example/:id': { id: string };
  '/financial/insurance/:user_id': { user_id: string };
  '/financial/insurance/:user_id/info/:id': { user_id: string; id: string };
  '/financial/metro/:user_id': { user_id: string };
  '/financial/metro/:user_id/info/:id': { user_id: string; id: string };
  '/freecycle/items/:id': { id: string };
  '/freecycle/items/edit/:id': { id: string };
  '/harm/:id': { id: string };
  '/map/:id': { id: string };
  '/power-bi/:type/:category': { type: string; category: string };
  '/power-bi/:type/:category/:id': {
    type: string;
    category: string;
    id: string;
  };
  '/power-bi/edit/:id': { id: string };
  '/sos/:id': { id: string };
  '/sos/report/:id': { id: string };
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
