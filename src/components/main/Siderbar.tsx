import { useAuth } from '@/features/auth';
import { useNavigate } from '@/router';
import { useLogout } from '@/hooks/useLogout';
import { useEffect } from 'react';
import { Link } from 'react-router';

export function Sidebar() {
  // Sidebar icons as SVG elements
  //   const icons_sidebar = [
  //     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  //         <path d="M22 22H2" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
  //         <path d="M17 22V6C17 4.11438 17 3.17157 16.4142 2.58579C15.8284 2 14.8856 2 13 2H11C9.11438 2 8.17157 2 7.58579 2.58579C7 3.17157 7 4.11438 7 6V22" stroke="black" strokeWidth="1.5"/>
  //         <path d="M21 22V11.5C21 10.0955 21 9.39331 20.6629 8.88886C20.517 8.67048 20.3295 8.48298 20.1111 8.33706C19.6067 8 18.9045 8 17.5 8" stroke="black" strokeWidth="1.5"/>
  //         <path d="M3 22V11.5C3 10.0955 3 9.39331 3.33706 8.88886C3.48298 8.67048 3.67048 8.48298 3.88886 8.33706C4.39331 8 5.09554 8 6.5 8" stroke="black" strokeWidth="1.5"/>
  //         <path d="M12 22V19" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
  //         <path d="M10 5H14" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
  //         <path d="M10 8H14" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
  //         <path d="M10 11H14" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
  //         <path d="M10 14H14" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
  //     </svg>,
  //     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  //         <path d="M4 10C4 6.22876 4 4.34315 5.17157 3.17157C6.34315 2 8.22876 2 12 2C15.7712 2 17.6569 2 18.8284 3.17157C20 4.34315 20 6.22876 20 10V12C20 15.7712 20 17.6569 18.8284 18.8284C17.6569 20 15.7712 20 12 20C8.22876 20 6.34315 20 5.17157 18.8284C4 17.6569 4 15.7712 4 12V10Z" stroke="black" strokeWidth="1.5"/>
  //         <path d="M4 13H20" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  //         <path d="M15.5 16H17" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  //         <path d="M7 16H8.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  //         <path d="M6 19.5V21C6 21.5523 6.44772 22 7 22H8.5C9.05228 22 9.5 21.5523 9.5 21V20" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  //         <path d="M18 19.5V21C18 21.5523 17.5523 22 17 22H15.5C14.9477 22 14.5 21.5523 14.5 21V20" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  //         <path d="M20 9H21C21.5523 9 22 9.44772 22 10V11C22 11.3148 21.8518 11.6111 21.6 11.8L20 13" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  //         <path d="M4 9H3C2.44772 9 2 9.44772 2 10V11C2 11.3148 2.14819 11.6111 2.4 11.8L4 13" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  //         <path d="M19.5 5H4.5" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
  //     </svg>,
  //     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  //         <path d="M12.0002 16C6.24021 16 5.21983 10.2595 5.03907 5.70647C4.98879 4.43998 4.96365 3.80673 5.43937 3.22083C5.91508 2.63494 6.48445 2.53887 7.62318 2.34674C8.74724 2.15709 10.2166 2 12.0002 2C13.7837 2 15.2531 2.15709 16.3771 2.34674C17.5159 2.53887 18.0852 2.63494 18.5609 3.22083C19.0367 3.80673 19.0115 4.43998 18.9612 5.70647C18.7805 10.2595 17.7601 16 12.0002 16Z" stroke="black" strokeWidth="1.5"/>
  //         <path d="M12 16V19" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
  //         <path d="M15.5 22H8.5L8.83922 20.3039C8.93271 19.8365 9.34312 19.5 9.8198 19.5H14.1802C14.6569 19.5 15.0673 19.8365 15.1608 20.3039L15.5 22Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  //         <path d="M19 5L19.9486 5.31621C20.9387 5.64623 21.4337 5.81124 21.7168 6.20408C22 6.59692 22 7.11873 21.9999 8.16234V8.23487C21.9999 9.09561 21.9999 9.52598 21.7927 9.87809C21.5855 10.2302 21.2093 10.4392 20.4569 10.8572L17.5 12.5" stroke="black" strokeWidth="1.5"/>
  //         <path d="M4.99994 5L4.05132 5.31621C3.06126 5.64623 2.56623 5.81124 2.2831 6.20408C1.99996 6.59692 1.99997 7.11873 2 8.16234V8.23487C2.00003 9.09561 2.00004 9.52598 2.20723 9.87809C2.41441 10.2302 2.79063 10.4392 3.54305 10.8572L6.49994 12.5" stroke="black" strokeWidth="1.5"/>
  //         <path d="M11.1459 6.02251C11.5259 5.34084 11.7159 5 12 5C12.2841 5 12.4741 5.34084 12.8541 6.02251L12.9524 6.19887C13.0603 6.39258 13.1143 6.48944 13.1985 6.55334C13.2827 6.61725 13.3875 6.64097 13.5972 6.68841L13.7881 6.73161C14.526 6.89857 14.895 6.98205 14.9828 7.26432C15.0706 7.54659 14.819 7.84072 14.316 8.42898L14.1858 8.58117C14.0429 8.74833 13.9714 8.83191 13.9392 8.93531C13.9071 9.03872 13.9179 9.15023 13.9395 9.37327L13.9592 9.57632C14.0352 10.3612 14.0733 10.7536 13.8435 10.9281C13.6136 11.1025 13.2682 10.9435 12.5773 10.6254L12.3986 10.5431C12.2022 10.4527 12.1041 10.4075 12 10.4075C11.8959 10.4075 11.7978 10.4527 11.6014 10.5431L11.4227 10.6254C10.7318 10.9435 10.3864 11.1025 10.1565 10.9281C9.92674 10.7536 9.96476 10.3612 10.0408 9.57632L10.0605 9.37327C10.0821 9.15023 10.0929 9.03872 10.0608 8.93531C10.0286 8.83191 9.95713 8.74833 9.81418 8.58117L9.68403 8.42898C9.18097 7.84072 8.92945 7.54659 9.01723 7.26432C9.10501 6.98205 9.47396 6.89857 10.2119 6.73161L10.4028 6.68841C10.6125 6.64097 10.7173 6.61725 10.8015 6.55334C10.8857 6.48944 10.9397 6.39258 11.0476 6.19887L11.1459 6.02251Z" stroke="black" strokeWidth="1.5"/>
  //         <path d="M18 22H6" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
  //     </svg>,
  //     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  //         <path d="M6.28571 18C3.91878 18 2 16.1038 2 13.7647C2 11.4256 3.91878 9.52941 6.28571 9.52941C6.56983 9.52941 6.8475 9.55673 7.11616 9.60887M7.11616 9.60887C6.88706 8.9978 6.7619 8.33687 6.7619 7.64706C6.7619 4.52827 9.32028 2 12.4762 2C15.4159 2 17.8371 4.19371 18.1551 7.01498M7.11616 9.60887C7.68059 9.71839 8.20528 9.9374 8.66667 10.2426M14.381 7.02721C14.9767 6.81911 15.6178 6.70588 16.2857 6.70588C16.9404 6.70588 17.5693 6.81468 18.1551 7.01498M18.1551 7.01498C20.393 7.78024 22 9.88113 22 12.3529C22 15.0599 20.0726 17.3221 17.5 17.8722" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
  //         <path d="M10 22.0002L14.2857 18.3078H10L14.2857 14.6152" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  //     </svg>,
  //     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  //         <path d="M22 22H2" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
  //         <path d="M17 22V6C17 4.11438 17 3.17157 16.4142 2.58579C15.8284 2 14.8856 2 13 2H11C9.11438 2 8.17157 2 7.58579 2.58579C7 3.17157 7 4.11438 7 6V22" stroke="black" strokeWidth="1.5"/>
  //         <path d="M21 22V8.5C21 7.09554 21 6.39331 20.6629 5.88886C20.517 5.67048 20.3295 5.48298 20.1111 5.33706C19.6067 5 18.9045 5 17.5 5" stroke="black" strokeWidth="1.5"/>
  //         <path d="M3 22V8.5C3 7.09554 3 6.39331 3.33706 5.88886C3.48298 5.67048 3.67048 5.48298 3.88886 5.33706C4.39331 5 5.09554 5 6.5 5" stroke="black" strokeWidth="1.5"/>
  //         <path d="M12 22V19" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
  //         <path d="M10 12H14" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
  //         <path d="M5.5 11H7" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
  //         <path d="M5.5 14H7" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
  //         <path d="M17 11H18.5" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
  //         <path d="M17 14H18.5" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
  //         <path d="M5.5 8H7" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
  //         <path d="M17 8H18.5" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
  //         <path d="M10 15H14" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
  //         <path d="M12 9V5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  //         <path d="M14 7H10" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  //     </svg>,
  //     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  //         <path d="M4 8C4 5.17157 4 3.75736 4.87868 2.87868C5.75736 2 7.17157 2 10 2H14C16.8284 2 18.2426 2 19.1213 2.87868C20 3.75736 20 5.17157 20 8V16C20 18.8284 20 20.2426 19.1213 21.1213C18.2426 22 16.8284 22 14 22H10C7.17157 22 5.75736 22 4.87868 21.1213C4 20.2426 4 18.8284 4 16V8Z" stroke="black" strokeWidth="1.5"/>
  //         <path d="M19.8978 16H7.89778C6.96781 16 6.50282 16 6.12132 16.1022C5.08604 16.3796 4.2774 17.1883 4 18.2235" stroke="black" strokeWidth="1.5"/>
  //         <path d="M8 7H16" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
  //         <path d="M8 10.5H13" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
  //         <path d="M13 16V19.5309C13 19.8065 13 19.9443 12.9051 20C12.8103 20.0557 12.6806 19.9941 12.4211 19.8708L11.1789 19.2808C11.0911 19.2391 11.0472 19.2182 11 19.2182C10.9528 19.2182 10.9089 19.2391 10.8211 19.2808L9.57889 19.8708C9.31943 19.9941 9.18971 20.0557 9.09485 20C9 19.9443 9 19.8065 9 19.5309V16.45" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
  //     </svg>,
  //     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  //         <path d="M10.0376 5.31617L10.6866 6.4791C11.2723 7.52858 11.0372 8.90532 10.1147 9.8278C10.1147 9.8278 8.99588 10.9468 11.0245 12.9755C13.0525 15.0035 14.1722 13.8853 14.1722 13.8853C15.0947 12.9628 16.4714 12.7277 17.5209 13.3134L18.6838 13.9624C20.2686 14.8468 20.4557 17.0692 19.0628 18.4622C18.2258 19.2992 17.2004 19.9505 16.0669 19.9934C14.1588 20.0658 10.9183 19.5829 7.6677 16.3323C4.41713 13.0817 3.93421 9.84122 4.00655 7.93309C4.04952 6.7996 4.7008 5.77423 5.53781 4.93723C6.93076 3.54428 9.15317 3.73144 10.0376 5.31617Z" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
  //     </svg>,
  //     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  //         <path d="M12 10C14.2091 10 16 8.20914 16 6C16 3.79086 14.2091 2 12 2C9.79086 2 8 3.79086 8 6C8 8.20914 9.79086 10 12 10Z" fill="black"/>
  //         <path d="M12 21C15.866 21 19 19.2091 19 17C19 14.7909 15.866 13 12 13C8.13401 13 5 14.7909 5 17C5 19.2091 8.13401 21 12 21Z" fill="black"/>
  //     </svg>,
  //     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  //         <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="black" strokeWidth="1.5"/>
  //         <path d="M13.7654 2.15224C13.3978 2 12.9319 2 12 2C11.0681 2 10.6022 2 10.2346 2.15224C9.74457 2.35523 9.35522 2.74458 9.15223 3.23463C9.05957 3.45834 9.0233 3.7185 9.00911 4.09799C8.98826 4.65568 8.70226 5.17189 8.21894 5.45093C7.73564 5.72996 7.14559 5.71954 6.65219 5.45876C6.31645 5.2813 6.07301 5.18262 5.83294 5.15102C5.30704 5.08178 4.77518 5.22429 4.35436 5.5472C4.03874 5.78938 3.80577 6.1929 3.33983 6.99993C2.87389 7.80697 2.64092 8.21048 2.58899 8.60491C2.51976 9.1308 2.66227 9.66266 2.98518 10.0835C3.13256 10.2756 3.3397 10.437 3.66119 10.639C4.1338 10.936 4.43789 11.4419 4.43786 12C4.43783 12.5581 4.13375 13.0639 3.66118 13.3608C3.33965 13.5629 3.13248 13.7244 2.98508 13.9165C2.66217 14.3373 2.51966 14.8691 2.5889 15.395C2.64082 15.7894 2.87379 16.193 3.33973 17C3.80568 17.807 4.03865 18.2106 4.35426 18.4527C4.77508 18.7756 5.30694 18.9181 5.83284 18.8489C6.07289 18.8173 6.31632 18.7186 6.65204 18.5412C7.14547 18.2804 7.73556 18.27 8.2189 18.549C8.70224 18.8281 8.98826 19.3443 9.00911 19.9021C9.02331 20.2815 9.05957 20.5417 9.15223 20.7654C9.35522 21.2554 9.74457 21.6448 10.2346 21.8478C10.6022 22 11.0681 22 12 22C12.9319 22 13.3978 22 13.7654 21.8478C14.2554 21.6448 14.6448 21.2554 14.8477 20.7654C14.9404 20.5417 14.9767 20.2815 14.9909 19.902C15.0117 19.3443 15.2977 18.8281 15.781 18.549C16.2643 18.2699 16.8544 18.2804 17.3479 18.5412C17.6836 18.7186 17.927 18.8172 18.167 18.8488C18.6929 18.9181 19.2248 18.7756 19.6456 18.4527C19.9612 18.2105 20.1942 17.807 20.6601 16.9999C21.1261 16.1929 21.3591 15.7894 21.411 15.395C21.4802 14.8691 21.3377 14.3372 21.0148 13.9164C20.8674 13.7243 20.6602 13.5628 20.3387 13.3608C19.8662 13.0639 19.5621 12.558 19.5621 11.9999C19.5621 11.4418 19.8662 10.9361 20.3387 10.6392C20.6603 10.4371 20.8675 10.2757 21.0149 10.0835C21.3378 9.66273 21.4803 9.13087 21.4111 8.60497C21.3592 8.21055 21.1262 7.80703 20.6602 7C20.1943 6.19297 19.9613 5.78945 19.6457 5.54727C19.2249 5.22436 18.693 5.08185 18.1671 5.15109C17.9271 5.18269 17.6837 5.28136 17.3479 5.4588C16.8545 5.71959 16.2644 5.73002 15.7811 5.45096C15.2977 5.17191 15.0117 4.65566 14.9909 4.09794C14.9767 3.71848 14.9404 3.45833 14.8477 3.23463C14.6448 2.74458 14.2554 2.35523 13.7654 2.15224Z" stroke="black" strokeWidth="1.5"/>
  //     </svg>,
  //     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  //         <path d="M6 10H10" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  //         <path d="M20.8333 11H18.2308C16.4465 11 15 12.3431 15 14C15 15.6569 16.4465 17 18.2308 17H20.8333C20.9167 17 20.9583 17 20.9935 16.9979C21.5328 16.965 21.9623 16.5662 21.9977 16.0654C22 16.0327 22 15.994 22 15.9167V12.0833C22 12.006 22 11.9673 21.9977 11.9346C21.9623 11.4338 21.5328 11.035 20.9935 11.0021C20.9583 11 20.9167 11 20.8333 11Z" stroke="black" strokeWidth="1.5"/>
  //         <path d="M20.965 11C20.8873 9.1277 20.6366 7.97975 19.8284 7.17157C18.6569 6 16.7712 6 13 6H10C6.22876 6 4.34315 6 3.17157 7.17157C2 8.34315 2 10.2288 2 14C2 17.7712 2 19.6569 3.17157 20.8284C4.34315 22 6.22876 22 10 22H13C16.7712 22 18.6569 22 19.8284 20.8284C20.6366 20.0203 20.8873 18.8723 20.965 17" stroke="black" strokeWidth="1.5"/>
  //         <path d="M6 6L9.73549 3.52313C10.7874 2.82562 12.2126 2.82562 13.2645 3.52313L17 6" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
  //         <path d="M17.9912 14H18.0002" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  //     </svg>
  // ];

  const icons_name = [
    'City insights',
    'Transport',
    'Events',
    'Weather reports',
    'Healthcare',
    'Know Ai',
    'Contact us',
    'Profile',
    'Setting',
    'E-wallet',
  ];

  const icons_description = [
    'dashboard and quick service',
    'Bus timing and routes',
    'Activities and volunteer',
    'Forecast & Air Quality',
    'Hospital & Emergency services',
    'Learning with Ai',
    'Report issues',
  ];

  // Sidebar positions
  const positions = [0, 1, 2, 3, 4, 5, 6];
  const positions2 = [7, 8, 9];

  // Logout function and authentication check
  const navigate = useNavigate();
  const { mutate, isPending: isLoggingOut } = useLogout();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleLogout = () => {
    mutate(undefined, {
      onSuccess: () => {
        navigate('/login');
      },
    });
  };

  // Navigate function for each sidebar item
  const navigate_item = [
    '/',
    '/public_transportation',
    '/event_hub',
    '/weatherCity',
    '/healthcare',
    '/Know-AI/createCourse',
    '/',
    '/profile',
    '/citizen/setting',
    '/e-wallet',
  ];

  return (
    <>
      <aside
        className={'min-h-screen w-[215px] border-r-2 border-[#D9D9D9]'}
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        {/*Menu_Top_one*/}
        {positions.map((index, key) => (
          <>
            <Link
              to={navigate_item[index]}
              key={key}
              className="flex cursor-pointer flex-col gap-1 px-4 py-3 hover:bg-gray-200"
            >
              <div className="flex items-center gap-3">
                <div>{/* {icons_sidebar[index]} */}</div>

                <div className="font-medium text-gray-800">
                  {icons_name[index]}
                </div>
              </div>
              <div className="text-[11px]">{icons_description[index]}</div>
            </Link>
          </>
        ))}

        {/*Menu_Bottom_one*/}
        <div className="border-t-1 border-[#D9D9D9]">
          {positions2.map((index, key) => (
            <>
              <Link
                to={navigate_item[index]}
                key={key}
                className="flex cursor-pointer flex-col gap-1 px-4 py-3 hover:bg-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div>{/* {icons_sidebar[index]} */}</div>

                  <div className="text-[11px] font-medium text-gray-800">
                    {icons_name[index]}
                  </div>
                </div>
              </Link>
            </>
          ))}
        </div>

        {/* Button Log out */}
        <div className="mt-7 flex justify-center">
          <button
            onClick={handleLogout}
            className="flex cursor-pointer items-center gap-5 rounded-xl bg-[#01ccffeb] px-6 py-3"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.00195 7C9.01406 4.82497 9.11051 3.64706 9.87889 2.87868C10.7576 2 12.1718 2 15.0002 2H16.0002C18.8286 2 20.2429 2 21.1215 2.87868C22.0002 3.75736 22.0002 5.17157 22.0002 8V16C22.0002 18.8284 22.0002 20.2426 21.1215 21.1213C20.2429 22 18.8286 22 16.0002 22H15.0002C12.1718 22 10.7576 22 9.87889 21.1213C9.11051 20.3529 9.01406 19.175 9.00195 17"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M15 12H2M2 12L5.5 9M2 12L5.5 15"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p
              className={`font-medium ${isLoggingOut ? 'text-[12px]' : 'text-[16px]'}`}
            >
              {isLoggingOut ? 'Signing out...' : 'Sign out'}
            </p>
          </button>
        </div>
      </aside>
    </>
  );
}
