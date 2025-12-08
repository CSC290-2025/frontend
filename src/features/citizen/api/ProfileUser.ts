export const fetchUserProfile = async (userId: number) => {
  // fake user basic info
  return {
    id: userId, // แสดงว่าเป็น userId ที่เรียกเข้ามา
    username: 'beli buli', // mock username
    phone: '090-000-0000', // mock phone
  };
};

export const fetchUserProfileDetails = async (userId: number) => {
  // fake user detail info
  return {
    firstName: 'Mock_Mock_na_baby',
    middleName: '',
    lastName: 'User',
    address: 'Bangkok, Thailand',
  };
};
