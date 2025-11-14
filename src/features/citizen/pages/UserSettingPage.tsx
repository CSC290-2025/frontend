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
        EmergencyContact: user.emergency_contacts?.[0]?.phone,
        AddressLine: user.user_profiles?.addresses?.address_line,
        SubDistrict: user.user_profiles?.addresses?.subdistrict,
        District: user.user_profiles?.addresses?.district,
        Province: user.user_profiles?.addresses?.province,
        PostalCode: user.user_profiles?.addresses?.postal_code,
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
        console.log(apiData);

        const mappedData = mapUserData(apiData);
        setUser(mappedData);
      } catch (err) {
        console.error(err);
      }
    };
    getUser();
  }, [userID]);

  const handlePersonalChange = (newData: any) => {
    setUser((prev: any) => ({
      ...prev,
      personal: newData,
    }));
  };

  const handleHealthChange = (newData: any) => {
    setUser((prev: any) => ({
      ...prev,
      health: newData,
    }));
  };

  const handleAccountChange = (newData: any) => {
    setUser((prev: any) => ({
      ...prev,
      account: newData,
    }));
  };

  if (!user) return <div>Loading...</div>;

  const { personal, health, account, picture } = user;

  const handleSave = async () => {
    try {
      const personalPayload = {
        user: {
          id_card_number: personal.IdCardNumber,
          first_name: personal.Firstname,
          middle_name: personal.Middlename,
          last_name: personal.Lastname,
          ethnicity: personal.Enthnicity,
          nationality: personal.Nationality,
          religion: personal.Religion,
        },
        address: {
          address_line: personal.AddressLine,
          province: personal.Province,
          district: personal.District,
          subdistrict: personal.SubDistrict,
          postal_code: personal.PostalCode,
        },
      };

      const healthPayload = {
        birth_date: health.BirthDate,
        blood_type: health.BloodType,
        congenital_disease: health.CongenitalDisease,
        allergy: health.Allergic,
        height: Number(health.Height),
        weight: Number(health.Weight),
        gender: health.Gender,
      };

      const accountPayload = {
        username: account.Username,
        email: account.Email,
        profile_picture: picture,
      };

      await UserAPI.updateUserPersonal(userID, personalPayload);
      await UserAPI.updateUserHealth(userID, healthPayload);
      await UserAPI.updateUserAccount(userID, accountPayload);

      alert('Saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save.');
    }
  };

  return (
    <div className="absolute top-[70px] left-[258px] flex w-[1082px] flex-col gap-[37px] rounded-[20px] border opacity-100">
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
          {user && activeTab === 'personal' && (
            <Personal data={personal} onDataChange={handlePersonalChange} />
          )}
          {user && activeTab === 'health' && (
            <Health data={health} onDataChange={handleHealthChange} />
          )}
          {user && activeTab === 'account' && (
            <Account data={account} onDataChange={handleAccountChange} />
          )}
          <div className="mt-4 mb-[27px] flex justify-center">
            <button
              className="cursor-pointer rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserSettingPage;
