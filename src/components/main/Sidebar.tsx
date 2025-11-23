import { useAuth } from '@/features/auth';
import { useNavigate } from '@/router';
import { useLogout } from '@/hooks/useLogout';
import { useEffect } from 'react';
import { Link } from 'react-router';
import {
  Building,
  BusFront,
  Trophy,
  CloudLightning,
  Hospital,
  BookText,
  Phone,
  CircleUser,
  Settings,
  Wallet,
} from 'lucide-react';

export default function Sidebar() {
  // Sidebar icons as SVG elements
  const icons_sidebar = [
    Building,
    BusFront,
    Trophy,
    CloudLightning,
    Hospital,
    BookText,
    Phone,
    CircleUser,
    Settings,
    Wallet,
  ];

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
    '/financial',
  ];

  return (
    <>
      <aside
        className={'min-h-screen w-[215px] border-r-2 border-[#D9D9D9]'}
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        {/*Menu_Top_one*/}
        {positions.map((index) => {
          const Icon = icons_sidebar[index];
          return (
            <>
              <Link
                to={navigate_item[index]}
                key={index}
                className="flex cursor-pointer flex-col gap-1 px-4 py-3 hover:bg-gray-200"
              >
                <div className="flex items-center gap-3">
                  <Icon key={index} />

                  <div className="font-medium text-gray-800">
                    {icons_name[index]}
                  </div>
                </div>
                <div className="text-[11px]">{icons_description[index]}</div>
              </Link>
            </>
          );
        })}

        {/*Menu_Bottom_one*/}
        <div className="border-t-1 border-[#D9D9D9]">
          {positions2.map((index) => {
            const Icon = icons_sidebar[index];
            return (
              <>
                <Link
                  to={navigate_item[index]}
                  key={index}
                  className="flex cursor-pointer flex-col gap-1 px-4 py-3 hover:bg-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <Icon key={index} />
                    <div className="text-[11px] font-medium text-gray-800">
                      {icons_name[index]}
                    </div>
                  </div>
                </Link>
              </>
            );
          })}
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
