import { useState, useEffect } from 'react';
import Personal from '../components/userSettingPage/Personal';
import Health from '../components/userSettingPage/Health';
import Account from '../components/userSettingPage/Account';
import Picture from '../components/userSettingPage/Picture';
import { UserAPI } from '../api';

function UserSettingPage() {
  const userID = 7;
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('personal');

  const mapUserData = (userApiData: any) => {
    const user = userApiData.user;
    return {
      personal: {
        IdCardNumber: user.user_profiles?.id_card_number || '',
        Firstname: user.user_profiles?.first_name || '',
        Middlename: user.user_profiles?.middle_name || '',
        Lastname: user.user_profiles?.last_name || '',
        Enthnicity: user.user_profiles?.ethnicity || '',
        Nationality: user.user_profiles?.nationality || '',
        Religion: user.user_profiles?.religion || '',
        PhoneNumber: user.phone || '',
        EmergencyContact: user.emergency_contacts?.[0]?.phone || '',
        AddressLine: user.user_profiles?.addresses?.[0]?.address_line || '',
        SubDistrict: user.user_profiles?.addresses?.[0]?.subdistrict || '',
        District: user.user_profiles?.addresses?.[0]?.district || '',
        Province: user.user_profiles?.addresses?.[0]?.province || '',
        PostalCode: user.user_profiles?.addresses?.[0]?.postal_code || '',
      },
      health: {
        BirthDate: user.user_profiles?.birth_date
          ? new Date(user.user_profiles.birth_date).toISOString().split('T')[0]
          : '',
        BloodType: user.user_profiles?.blood_type || 'none',
        CongenitalDisease: user.user_profiles?.congenital_disease || '',
        Allergic: user.user_profiles?.allergy || '',
        Insurance: user.insurance_cards?.[0]?.card_number || '',
        Height: user.user_profiles?.height || 0,
        Weight: user.user_profiles?.weight || 0,
        Gender: user.user_profiles?.gender || 'none',
      },
      account: {
        Username: user.username || '',
        Email: user.email || '',
      },
      picture: user.user_profiles?.profile_picture || null,
    };
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const apiData = await UserAPI.getUserProflie(userID);
        const mappedData = mapUserData(apiData);
        setUser(mappedData);
      } catch (err) {
        console.error(err);
      }
    };
    getUser();
  }, [userID]);

  if (!user) return <div>Loading...</div>;

  const { personal, health, account, picture } = user;

  return (
    <div className="absolute top-[70px] left-[258px] flex h-[1297px] w-[1082px] flex-col gap-[37px] rounded-[20px] border opacity-100">
      <div className="mt-[48px] ml-[80px] flex h-[78px] w-[373px] gap-[26px]">
        {/* icon */}
        <h1 className="text-[48px] text-[#2B5991]">Edit Profile</h1>
      </div>
      <div className="flex gap-[20px]">
        <div>
          <Picture username={account.Username} picture={picture} />
        </div>
        <div>
          <div className="mb-[39px] flex">
            <div
              className={`flex h-[47px] w-[209px] cursor-pointer items-center justify-center transition-colors ${
                activeTab === 'personal' ? 'bg-[#96E0E1]' : 'bg-white'
              }`}
              onClick={() => setActiveTab('personal')}
            >
              <h2 className="text-[20px] text-[#2B5991]">Personal</h2>
            </div>
            <div
              className={`flex h-[47px] w-[209px] cursor-pointer items-center justify-center transition-colors ${
                activeTab === 'health' ? 'bg-[#96E0E1]' : 'bg-white'
              }`}
              onClick={() => setActiveTab('health')}
            >
              <h2 className="text-[20px] text-[#2B5991]">Health</h2>
            </div>
            <div
              className={`flex h-[47px] w-[209px] cursor-pointer items-center justify-center transition-colors ${
                activeTab === 'account' ? 'bg-[#96E0E1]' : 'bg-white'
              }`}
              onClick={() => setActiveTab('account')}
            >
              <h2 className="text-[20px] text-[#2B5991]">Account</h2>
            </div>
          </div>
          {user && activeTab === 'personal' && <Personal data={personal} />}
          {user && activeTab === 'health' && <Health data={health} />}
          {user && activeTab === 'account' && <Account data={account} />}
        </div>
      </div>
    </div>
  );
}

export default UserSettingPage;
