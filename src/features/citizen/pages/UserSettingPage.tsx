import { useState, useEffect } from 'react';
import Personal from '../components/userSettingPage/Personal';
import Health from '../components/userSettingPage/Health';
import Account from '../components/userSettingPage/Account';
import Picture from '../components/userSettingPage/Picture';
import { UserAPI } from '../api';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from '@/router';
import { useGetAuthMe } from '@/api/generated/authentication';
import Layout from '@/components/main/Layout';

function UserSettingPage() {
  const userID = useGetAuthMe().data?.data?.userId;
  const [user, setUser] = useState<any>(null);
  const [specialists, setSpecialists] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('personal');
  const [validationErrors, setValidationErrors] = useState<{
    personal: Record<string, string>;
    health: Record<string, string>;
    account: Record<string, string>;
  }>({
    personal: {},
    health: {},
    account: {},
  });

  const [selectedProfilePicture, setSelectedProfilePicture] =
    useState<File | null>(null);

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
        console.log('User data:', apiData);
        const mappedData = mapUserData(apiData);
        setUser(mappedData);
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };
    console.log(userID);
    const getSpecialists = async () => {
      try {
        const response = await UserAPI.getUserSpecialists(userID);
        console.log('Specialists response:', response);

        if (response?.data?.specialists) {
          setSpecialists(response.data.specialists);
        } else if (response?.specialists) {
          setSpecialists(response.specialists);
        } else if (Array.isArray(response)) {
          setSpecialists(response);
        } else {
          setSpecialists([]);
        }
      } catch (err) {
        console.error('Error fetching specialists:', err);
        setSpecialists([]);
      }
    };

    const getUserRoles = async () => {
      try {
        const response = await UserAPI.getUserRoles(userID);
        console.log('User roles response:', response);

        if (response?.roles) {
          setUserRoles(response.roles);
        } else if (Array.isArray(response)) {
          setUserRoles(response);
        } else {
          setUserRoles([]);
        }
      } catch (err) {
        console.error('Error fetching user roles:', err);
        setUserRoles([]);
      }
    };

    getUser();
    getSpecialists();
    getUserRoles();
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

  const handleValidationErrors = (
    section: 'personal' | 'health' | 'account',
    errors: Record<string, string>
  ) => {
    setValidationErrors((prev) => ({
      ...prev,
      [section]: errors,
    }));
  };

  const handleBackButton = () => {
    navigate('/citizen/profile');
  };

  if (!user) {
    return (
      <Layout>
        <div></div>
      </Layout>
    );
  }
  if (!userID) {
    navigate('/login');
  }

  const { personal, health, account } = user;
  let { picture } = user;

  const handleSave = async () => {
    // Validate all fields before saving
    const validateAllFields = () => {
      const allErrors: {
        personal: Record<string, string>;
        health: Record<string, string>;
        account: Record<string, string>;
      } = {
        personal: {},
        health: {},
        account: {},
      };

      // Validate Personal fields
      const personalFieldsToValidate = [
        'IdCardNumber',
        'Firstname',
        'Lastname',
        'PhoneNumber',
        'AddressLine',
        'SubDistrict',
        'District',
        'Province',
        'PostalCode',
      ];

      personalFieldsToValidate.forEach((field) => {
        const value = personal[field as keyof typeof personal];
        if (field === 'Firstname' && (!value || value === '')) {
          allErrors.personal[field] = 'First name is required';
        } else if (field === 'Lastname' && (!value || value === '')) {
          allErrors.personal[field] = 'Last name is required';
        } else if (field === 'AddressLine' && (!value || value === '')) {
          allErrors.personal[field] = 'Address is required';
        } else if (field === 'SubDistrict' && (!value || value === '')) {
          allErrors.personal[field] = 'Sub-district is required';
        } else if (field === 'District' && (!value || value === '')) {
          allErrors.personal[field] = 'District is required';
        } else if (field === 'Province' && (!value || value === '')) {
          allErrors.personal[field] = 'Province is required';
        } else if (
          field === 'IdCardNumber' &&
          value &&
          value !== '' &&
          (value.length !== 13 || !/^\d+$/.test(value))
        ) {
          allErrors.personal[field] =
            'ID card number must be exactly 13 digits';
        } else if (
          field === 'PostalCode' &&
          value &&
          value !== '' &&
          (value.length !== 5 || !/^\d+$/.test(value))
        ) {
          allErrors.personal[field] = 'Postal code must be exactly 5 digits';
        } else if (
          field === 'PhoneNumber' &&
          value &&
          value !== '' &&
          !/^[0-9]{10}$|^[0-9]{3}-[0-9]{3}-[0-9]{4}$/.test(value)
        ) {
          allErrors.personal[field] =
            'Phone number must be in format: 0812345678 or 081-234-5678';
        }
      });

      // Validate Account fields
      if (!account.Username || account.Username.length < 3) {
        allErrors.account.Username = 'Username must be at least 3 characters';
      } else if (account.Username.length > 30) {
        allErrors.account.Username = 'Username must be less than 30 characters';
      }

      if (!account.Email || account.Email === '') {
        allErrors.account.Email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.Email)) {
        allErrors.account.Email = 'Please enter a valid email address';
      }

      // Validate Health fields
      if (health.Height && health.Height !== 0) {
        const heightNum =
          typeof health.Height === 'string'
            ? parseFloat(health.Height)
            : health.Height;
        if (isNaN(heightNum) || heightNum < 50 || heightNum > 300) {
          allErrors.health.Height = 'Height must be between 50 and 300 cm';
        }
      }

      if (health.Weight && health.Weight !== 0) {
        const weightNum =
          typeof health.Weight === 'string'
            ? parseFloat(health.Weight)
            : health.Weight;
        if (isNaN(weightNum) || weightNum < 2 || weightNum > 500) {
          allErrors.health.Weight = 'Weight must be between 2 and 500 kg';
        }
      }

      if (health.CongenitalDisease && health.CongenitalDisease.length > 500) {
        allErrors.health.CongenitalDisease =
          'Description must be less than 500 characters';
      }

      if (health.Allergic && health.Allergic.length > 500) {
        allErrors.health.Allergic =
          'Description must be less than 500 characters';
      }

      return allErrors;
    };

    // Run full validation
    const allValidationErrors = validateAllFields();

    // Update validation errors state
    setValidationErrors(allValidationErrors);

    // Check if there are any validation errors
    const hasPersonalErrors =
      Object.keys(allValidationErrors.personal).length > 0;
    const hasHealthErrors = Object.keys(allValidationErrors.health).length > 0;
    const hasAccountErrors =
      Object.keys(allValidationErrors.account).length > 0;

    if (hasPersonalErrors || hasHealthErrors || hasAccountErrors) {
      let errorMessage = 'Please fix the following errors before saving:\n\n';

      if (hasPersonalErrors) {
        errorMessage += '📋 Personal Information:\n';
        Object.entries(allValidationErrors.personal).forEach(
          ([field, error]) => {
            errorMessage += `  • ${error}\n`;
          }
        );
        errorMessage += '\n';
      }

      if (hasHealthErrors) {
        errorMessage += '🏥 Health Information:\n';
        Object.entries(allValidationErrors.health).forEach(([field, error]) => {
          errorMessage += `  • ${error}\n`;
        });
        errorMessage += '\n';
      }

      if (hasAccountErrors) {
        errorMessage += '👤 Account Information:\n';
        Object.entries(allValidationErrors.account).forEach(
          ([field, error]) => {
            errorMessage += `  • ${error}\n`;
          }
        );
      }

      alert(errorMessage.trim());

      // Switch to the first tab that has errors
      if (hasPersonalErrors) {
        setActiveTab('personal');
      } else if (hasHealthErrors) {
        setActiveTab('health');
      } else if (hasAccountErrors) {
        setActiveTab('account');
      }

      return;
    }

    try {
      if (selectedProfilePicture && userID) {
        const data = await UserAPI.updateUserProfilePicture(
          userID,
          selectedProfilePicture
        );
        console.log(data);
        picture = data.profilePictureUrl;
        console.log(data.profilePictureUrl);
      }

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
        birth_date: health.BirthDate || null,
        blood_type: health.BloodType === 'none' ? null : health.BloodType,
        congenital_disease: health.CongenitalDisease || null,
        allergy: health.Allergic || null,
        height: health.Height ? Number(health.Height) : null,
        weight: health.Weight ? Number(health.Weight) : null,
        gender: health.Gender === 'none' ? null : health.Gender,
      };

      const accountPayload = {
        username: account.Username,
        email: account.Email,
        profile_picture: picture,
      };

      await UserAPI.updateUserPersonal(userID, personalPayload);
      await UserAPI.updateUserHealth(userID, healthPayload);
      await UserAPI.updateUserAccount(userID, accountPayload);
      alert('Successfully saved! ✓');
    } catch (err: any) {
      console.error(err);
      alert(`Failed to save: ${err.response?.data?.message || err.message}`);
    }
  };

  const Tabs = () => (
    <div className="mb-5 flex justify-center overflow-x-auto md:mb-6">
      <div className="flex w-full gap-2">
        {['personal', 'health', 'account'].map((tab) => {
          const hasErrors =
            Object.keys(validationErrors[tab as keyof typeof validationErrors])
              .length > 0;

          return (
            <button
              key={tab}
              className={`group relative flex h-10 flex-1 cursor-pointer items-center justify-center rounded-xl border transition-all duration-300 md:h-11 ${
                activeTab === tab
                  ? 'border-cyan-400 bg-gradient-to-r from-cyan-400 to-blue-400 shadow-md'
                  : hasErrors
                    ? 'border-red-300 bg-red-50 hover:border-red-400'
                    : 'border-gray-200 bg-white hover:border-cyan-300 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              <h2
                className={`text-xs font-semibold capitalize transition-all duration-300 md:text-sm lg:text-base ${
                  activeTab === tab
                    ? 'text-white'
                    : hasErrors
                      ? 'text-red-600'
                      : 'text-gray-600 group-hover:text-cyan-400'
                }`}
              >
                {tab}
                {hasErrors && <span className="ml-1 text-xs">⚠️</span>}
              </h2>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="flex min-h-screen w-full justify-center bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-6 md:py-8">
        <div className="flex w-full max-w-[1100px] flex-col rounded-2xl bg-white px-5 py-6 shadow-xl md:px-8 md:py-8 lg:px-12 lg:py-10">
          <div className="mb-5 flex items-center gap-3 md:mb-6 lg:mb-8">
            <button
              onClick={handleBackButton}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-50 md:h-11 md:w-11"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600 md:h-6 md:w-6" />
            </button>
            <h1 className="text-2xl font-bold text-blue-900 md:text-3xl lg:text-4xl">
              Edit Profile
            </h1>
          </div>

          <div className="md:hidden">
            <Tabs />
          </div>

          <div className="flex flex-col gap-6 md:flex-row lg:gap-8">
            <div className="flex w-full shrink-0 justify-center md:w-auto md:justify-start">
              <Picture
                username={account.Username}
                picture={picture}
                userId={userID}
                onFileSelect={(file) => setSelectedProfilePicture(file)}
              />
            </div>

            <div className="w-full min-w-0 flex-1">
              <div className="hidden md:block">
                <Tabs />
              </div>

              <div className="w-full">
                <div className="transition-opacity duration-300 ease-in-out">
                  {user && activeTab === 'personal' && (
                    <Personal
                      data={personal}
                      specialists={specialists}
                      onDataChange={handlePersonalChange}
                      onValidationChange={(errors) =>
                        handleValidationErrors('personal', errors)
                      }
                    />
                  )}

                  {user && activeTab === 'health' && (
                    <Health
                      data={health}
                      onDataChange={handleHealthChange}
                      onValidationChange={(errors) =>
                        handleValidationErrors('health', errors)
                      }
                    />
                  )}

                  {user && activeTab === 'account' && (
                    <Account
                      data={account}
                      onDataChange={handleAccountChange}
                      roles={userRoles}
                      onValidationChange={(errors) =>
                        handleValidationErrors('account', errors)
                      }
                    />
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-center md:mt-8">
                <button
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-400 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg md:w-auto md:min-w-[180px] md:py-3"
                  onClick={handleSave}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="transition-transform group-hover:scale-110"
                  >
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default UserSettingPage;
