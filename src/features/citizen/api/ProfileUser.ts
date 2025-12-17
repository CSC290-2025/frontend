// src/features/citizen/api/ProfileUser.ts
import { apiClient } from '@/lib/apiClient';

/* =======================
   API TYPES
======================= */

type ApiSuccess<T> = {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
};

type AddressApi = {
  address_line?: string | null;
  province?: string | null;
  district?: string | null;
  subdistrict?: string | null;
  postal_code?: string | null;
};

type UserProfileRowApi = {
  id_card_number?: string | null;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  ethnicity?: string | null;
  nationality?: string | null;
  religion?: string | null;
  addresses?: AddressApi[] | AddressApi | null;
};

type UserProfileApi = {
  username?: string;
  phone?: string | null;
  email?: string;
  insurance_cards?: Array<{ card_number?: string | null }> | null;
  user_profiles?: UserProfileRowApi[] | UserProfileRowApi | null;
};

/* =======================
   VIEW MODEL
======================= */

export type ProfileVM = {
  userId: number;
  username: string;
  phone: string;
  email: string;

  idCardNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;

  ethnicity: string;
  nationality: string;
  religion: string;

  addressLine: string;
  province: string;
  district: string;
  subdistrict: string;
  postalCode: string;

  address: string;

  cardId: string;
  busCardBalance: string;
};

/* =======================
   API CALL
======================= */

// ✅ ใช้ apiClient แทน httpGet
export async function fetchUserProfileById(userId: number) {
  const res = await apiClient.get<ApiSuccess<{ user: UserProfileApi }>>(
    `/user/profile/${userId}`
  );
  return res.data;
}

/* =======================
   NORMALIZE DATA
======================= */

function normalizeProfile(
  userId: number,
  payload: ApiSuccess<{ user: UserProfileApi }>
): ProfileVM {
  const raw = payload.data.user;

  const userProfiles = raw?.user_profiles;
  const profile: UserProfileRowApi | undefined = Array.isArray(userProfiles)
    ? userProfiles[0]
    : (userProfiles ?? undefined);

  const addr = profile?.addresses ?? null;
  const addressObj: AddressApi | undefined = Array.isArray(addr)
    ? addr[0]
    : (addr ?? undefined);

  const address_line = addressObj?.address_line ?? '';
  const subdistrict = addressObj?.subdistrict ?? '';
  const district = addressObj?.district ?? '';
  const province = addressObj?.province ?? '';
  const postal_code = addressObj?.postal_code ?? '';

  const addressText =
    [address_line, subdistrict, district, province, postal_code]
      .filter(Boolean)
      .join(', ') || 'N/A';

  const cardId = raw?.insurance_cards?.[0]?.card_number ?? 'N/A';

  return {
    userId,
    username: raw?.username ?? 'N/A',
    phone: raw?.phone ?? 'N/A',
    email: raw?.email ?? 'N/A',

    idCardNumber: profile?.id_card_number ?? 'N/A',
    firstName: profile?.first_name ?? 'N/A',
    middleName: profile?.middle_name ?? '',
    lastName: profile?.last_name ?? 'N/A',

    ethnicity: profile?.ethnicity ?? 'N/A',
    nationality: profile?.nationality ?? 'N/A',
    religion: profile?.religion ?? 'N/A',

    addressLine: address_line || 'N/A',
    province: province || 'N/A',
    district: district || 'N/A',
    subdistrict: subdistrict || 'N/A',
    postalCode: postal_code || 'N/A',

    address: addressText,

    cardId,
    busCardBalance: 'N/A',
  };
}

/* =======================
   PUBLIC FUNCTION
======================= */

// ✅ ใช้อันนี้แทน fetchMyFullProfile
export async function fetchProfileForSettingUser(
  userId: number
): Promise<ProfileVM> {
  const profileRes = await fetchUserProfileById(userId);
  return normalizeProfile(userId, profileRes);
}
