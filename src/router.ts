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
  | `/Know-AI/adminAi`
  | `/Know-AI/createCourse`
  | `/Know-AI/exercises`
  | `/Know-AI/exercises/:level/:question`
  | `/MyRentedAPT`
  | `/activity`
  | `/chat`
  | `/citizen/profile`
  | `/citizen/profile/emergency`
  | `/citizen/profile/healthcare`
  | `/citizen/profile/volunteer`
  | `/citizen/profile/waste`
  | `/citizen/setting`
  | `/clean-air/district-detail/:district`
  | `/clean-air/district-selection`
  | `/event_hub`
  | `/event_hub/CreatePage`
  | `/event_hub/EditPage/:id`
  | `/example/:id`
  | `/financial`
  | `/financial/insurance`
  | `/financial/insurance/info/:id`
  | `/financial/metro`
  | `/financial/metro/info/:id`
  | `/financial/topup`
  | `/freecycle`
  | `/freecycle/items/:id`
  | `/freecycle/items/edit/:id`
  | `/freecycle/my-items`
  | `/freecycle/post-event`
  | `/freecycle/post-item`
  | `/harm`
  | `/harm/:id`
  | `/healthcare/Login`
  | `/healthcare/healthcare-admin`
  | `/healthcare/healthcare-user`
  | `/hotLine`
  | `/login`
  | `/map`
  | `/map/:id`
  | `/power-bi`
  | `/power-bi/:type/:category`
  | `/power-bi/:type/:category/:id`
  | `/power-bi/create`
  | `/power-bi/edit/:id`
  | `/public_transportation`
  | `/register`
  | `/reset-password`
  | `/reset-password/request`
  | `/sos`
  | `/sos/:id`
  | `/sos/report`
  | `/sos/report/:id`
  | `/traffic`
  | `/traffic/AddLight`
  | `/traffic/admin`
  | `/traffic/control`
  | `/traffic/tracking`
  | `/users`
  | `/volunteer/board`
  | `/volunteer/createpost`
  | `/volunteer/detail/:id`
  | `/volunteer/edit/:id`
  | `/volunteer/userjoin`
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
  '/event_hub/EditPage/:id': { id: string };
  '/example/:id': { id: string };
  '/financial/insurance/info/:id': { id: string };
  '/financial/metro/info/:id': { id: string };
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
  '/volunteer/detail/:id': { id: string };
  '/volunteer/edit/:id': { id: string };
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
