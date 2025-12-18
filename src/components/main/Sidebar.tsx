import { useAuth } from '@/features/auth';
import { useNavigate } from '@/router';
import { useLogout } from '@/hooks/useLogout';
import { useEffect, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router';
import {
  BusFront,
  Trophy,
  CloudLightning,
  Hospital,
  BookText,
  CircleUser,
  Settings,
  Wallet,
  Zap,
  Leaf,
  Shield,
  Users,
  MapPin,
  House,
  Heart,
  LogOut,
  ChevronDown,
  BarChart3,
  MessageSquare,
  Trees,
  AlertTriangle,
  PhoneOff,
  Activity,
  Radio,
  Cloud,
  Navigation,
} from 'lucide-react';

export default function Sidebar() {
  const [expandedSections, setExpandedSections] = useState({
    main: true,
    additional: true,
  });
  const location = useLocation();

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Main services - compact for sidebar
  const mainRoutes = [
    { icon: BusFront, label: 'Transport', path: '/public_transportation' },
    { icon: Trophy, label: 'Events', path: '/event_hub' },
    { icon: CloudLightning, label: 'Weather', path: '/weatherCity' },
    {
      icon: Hospital,
      label: 'Healthcare',
      path: '/healthcare/healthcare-user',
    },
    { icon: BookText, label: 'Learn AI', path: '/Know-AI/courses' },
  ];

  // Additional services with dropdown
  const additionalRoutes = [
    { icon: Zap, label: 'Power BI', path: '/power-bi' },
    { icon: Leaf, label: 'Waste Mgmt', path: '/waste-management' },
    { icon: Shield, label: 'Emergency', path: '/sos' },
    { icon: Users, label: 'Volunteer', path: '/volunteer/board' },
    { icon: MapPin, label: 'Map', path: '/map' },
    { icon: House, label: 'Apartments', path: '/ApartmentHomepage' },
    { icon: Heart, label: 'Freecycle', path: '/freecycle' },
    { icon: Trees, label: 'Clean Air', path: '/clean-air/district-selection' },
    { icon: AlertTriangle, label: 'Harm Reports', path: '/harm' },
    { icon: Radio, label: 'Traffic', path: '/traffic' },
    { icon: Activity, label: 'Activity', path: '/activity' },
    { icon: MessageSquare, label: 'Chat', path: '/chat' },
    { icon: PhoneOff, label: 'Hotline', path: '/hotLine' },
  ];

  // User routes
  const userRoutes = [
    { icon: CircleUser, label: 'Profile', path: '/citizen/profile' },
    { icon: Settings, label: 'Settings', path: '/citizen/setting' },
    { icon: Wallet, label: 'E-Wallet', path: '/financial' },
  ];

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

  const NavItem = ({
    route,
    compact = false,
  }: {
    route: any;
    compact?: boolean;
  }) => {
    const Icon = route.icon;
    const isActive =
      location.pathname === route.path ||
      location.pathname.startsWith(route.path + '/');
    return (
      <Link
        to={route.path}
        className={`group flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-all duration-200 ${
          isActive
            ? 'bg-blue-100 font-semibold text-blue-700'
            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
        }`}
      >
        <Icon className="h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110" />
        <span className="font-medium">{route.label}</span>
      </Link>
    );
  };

  return (
    <aside
      className="sticky top-0 flex h-screen w-64 flex-col border-r border-gray-200 bg-white"
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      {/* Header */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-transparent px-6 py-5">
        <div className="mb-1 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-blue-600">CityHub</h1>
            <p className="text-xs text-gray-500">Connected Services</p>
          </div>
        </div>
      </div>

      {/* Scrollable Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {/* Main Services */}
        <div className="mb-2">
          <button
            onClick={() => toggleSection('main')}
            className={`group flex w-full items-center justify-between px-4 py-2 text-xs font-semibold tracking-wider text-gray-600 uppercase hover:text-blue-600`}
          >
            <span>Quick Access</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${expandedSections.main ? 'rotate-180' : ''}`}
            />
          </button>
          {expandedSections.main && (
            <div className="space-y-1">
              {mainRoutes.map((route, idx) => (
                <NavItem key={idx} route={route} />
              ))}
            </div>
          )}
        </div>

        {/* Additional Services - Collapsible */}
        <div className="mb-2">
          <button
            onClick={() => toggleSection('additional')}
            className={`flex w-full items-center justify-between px-4 py-2 text-xs font-semibold tracking-wider text-gray-600 uppercase hover:text-emerald-600`}
          >
            <span>More Services</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${expandedSections.additional ? 'rotate-180' : ''}`}
            />
          </button>
          {expandedSections.additional && (
            <div className="space-y-1">
              {additionalRoutes.map((route, idx) => (
                <NavItem key={idx} route={route} />
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom Section - Fixed */}
      <div className="flex flex-col border-t border-gray-200 bg-gray-50">
        {/* User Section */}
        <div className="px-2 py-3">
          <p className="mb-2 px-4 text-xs font-semibold text-gray-500 uppercase">
            Account
          </p>
          <div className="space-y-1">
            {userRoutes.map((route, idx) => (
              <NavItem key={idx} route={route} />
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <div className="border-t border-gray-200 px-4 py-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 hover:text-red-700"
            disabled={isLoggingOut}
          >
            <LogOut className="h-4 w-4" />
            <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
