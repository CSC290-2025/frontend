import { useState, useEffect } from 'react';
import Personal from '../components/userSettingPage/Personal';
import Health from '../components/userSettingPage/Health';
import Account from '../components/userSettingPage/Account';
import Picture from '../components/userSettingPage/Picture';
import { UserAPI } from '../api';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from '@/router';

function UserSettingPage() {
  const userID = 7;
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('personal');
  const navigate = useNavigate();
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

  const handleBackButton = () => {
    navigate('/');
  };

  if (!user) return <div>Loading...</div>;

  const { personal, health, account, picture } = user;

  const handleSave = async () => {
    try {
      const personalPayload = {
        user: {
          phone: personal.PhoneNumber,
          user_profile: {
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
    } catch (err: any) {
      console.error(err);
      alert(`Failed to save: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="flex min-h-screen w-full justify-center bg-white pb-10">
      {/* Main Container */}
      <div className="flex w-full max-w-[1200px] flex-col px-4 md:px-10 lg:px-[80px]">
        {/* Header */}
        <div className="mt-6 mb-6 flex items-center gap-4 md:mt-8 md:mb-8 lg:mt-[48px] lg:mb-[37px]">
          <ChevronLeft
            className="h-8 w-8 cursor-pointer font-bold text-[#2B5991] md:h-10 md:w-10 lg:h-[77px] lg:w-[77px]"
            onClick={handleBackButton}
          />
          <h1 className="text-2xl font-bold text-[#2B5991] md:text-3xl lg:text-[48px]">
            Edit Profile
          </h1>
        </div>

        {/* Content Body */}
        <div className="flex flex-col gap-8 md:flex-row lg:gap-[20px]">
          {/* Left Sidebar - Picture */}
          {/* shrink-0 prevents the picture column from getting squashed */}
          <div className="flex w-full shrink-0 justify-center md:w-auto md:justify-start">
            <Picture username={account.Username} picture={picture} />
          </div>

          {/* Right Content - Forms */}
          <div className="w-full min-w-0 flex-1">
            {/* min-w-0 is crucial for flex children to shrink properly */}

            {/* Tabs */}
            <div className="mb-6 flex overflow-x-auto border-b pb-2 md:mb-8 md:border-none md:pb-0 lg:mb-[39px]">
              {['personal', 'health', 'account'].map((tab) => (
                <div
                  key={tab}
                  className={`flex h-10 min-w-[100px] flex-1 cursor-pointer items-center justify-center transition-colors md:h-[47px] md:max-w-[209px] ${activeTab === tab ? 'bg-[#96E0E1]' : 'bg-white'}`}
                  onClick={() => setActiveTab(tab)}
                >
                  <h2 className="text-sm text-[#2B5991] capitalize md:text-base lg:text-[20px]">
                    {tab}
                  </h2>
                </div>
              ))}
            </div>

            {/* Form Components */}
            <div className="w-full">
              {user && activeTab === 'personal' && (
                <Personal data={personal} onDataChange={handlePersonalChange} />
              )}

              {user && activeTab === 'health' && (
                <Health data={health} onDataChange={handleHealthChange} />
              )}

              {user && activeTab === 'account' && (
                <Account data={account} onDataChange={handleAccountChange} />
              )}
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-center md:mt-10 md:justify-start">
              <button
                className="w-full min-w-[120px] cursor-pointer rounded bg-blue-500 px-8 py-3 text-white transition-colors hover:bg-blue-600 md:w-auto"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserSettingPage;
