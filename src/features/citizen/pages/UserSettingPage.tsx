import { useState } from 'react';
import Personal from '../components/userSettingPage/Personal';
import Health from '../components/userSettingPage/Health';
import Account from '../components/userSettingPage/Account';
function UserSettingPage() {
  const bloodTypeOptions = ['A', 'B', 'AB', 'O'];
  const genderOptions = ['male', 'female', 'none'];
  const [bloodType, setBloodType] = useState(bloodTypeOptions[3]);
  const [gender, setGender] = useState(genderOptions[0]);
  const UserData = {
    personal: {
      IdCardNumber: '1102500052190',
      Firstname: 'Chetsadapiphat',
      Middlename: '',
      Lastname: 'Dangdeelert',
      Enthnicity: 'Thai',
      Nationality: 'Thai',
      Religion: 'Buddhism',
      PhoneNumber: '0937404956',
      EmergencyContact: '0937404956',
      AddressLine: '319/74 Merit Grand Suvanabhumi',
      SubDistrict: 'Bangpli Yai',
      District: 'Bangpli',
      Province: 'Samut Prakan',
      PostalCode: '10540',
    },
    health: {
      BirthDate: '2006-05-11',
      BloodType: bloodType,
      CongenitalDisease: 'Asthma',
      Allergic: 'Dust',
      Insurance: '',
      Height: 170,
      Weight: 87,
      Gender: gender,
    },
    account: {
      Username: 'Jedad',
      Email: 'jedsadapiphat.dang@mail.kmutt.ac.th',
    },
  };
  const { personal, health, account } = UserData;
  return (
    <div>
      <Personal data={personal} />
      <Health data={health} />
      <Account data={account} />
    </div>
  );
}
export default UserSettingPage;
