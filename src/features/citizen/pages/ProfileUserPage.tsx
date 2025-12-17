import React from 'react';
import { useNavigate } from '@/router';
import { Heart, Recycle, HandHeart, AlertCircle } from 'lucide-react';
import ProfileCard from '../components/ProfilePage/OverviewPage';
import Layout from '@/components/main/Layout';

export default function ProfileUserPage() {
  const navigate = useNavigate();

  return (
    <Layout>
      <main className="flex justify-center bg-gradient-to-br px-4 py-9">
        <div className="w-full max-w-7xl rounded-3xl bg-white p-8 shadow-2xl md:p-12">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <ProfileCard onEditProfile={() => navigate('/citizen/setting')} />
            </div>

            <div className="lg:col-span-2">
              <div className="mb-8">
                <h2 className="mb-3 text-4xl font-bold text-[#2B5991]">
                  Your Services
                </h2>
                <p className="text-lg text-[#2B5991]">
                  Access and manage your community services
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <ServiceBox
                  icon={<Recycle className="h-full w-full" />}
                  title="Waste Management"
                  desc="Waste services and history tracking"
                  color="bg-cyan-400"
                  hoverColor="hover:bg-cyan-500"
                  onClick={() => navigate('/citizen/profile/waste')}
                />

                <ServiceBox
                  icon={<HandHeart className="h-full w-full" />}
                  title="Volunteer"
                  desc="Find and join community volunteer programs"
                  color="bg-purple-400"
                  hoverColor="hover:bg-purple-500"
                  onClick={() => navigate('/citizen/profile/volunteer')}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

interface ServiceBoxProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
  hoverColor: string;
  onClick: () => void;
}

function ServiceBox({
  icon,
  title,
  desc,
  color,
  hoverColor,
  onClick,
}: ServiceBoxProps) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-2xl border border-gray-100 bg-white p-6 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl"
    >
      <div className="mb-6 flex justify-center">
        <div
          className={`inline-flex h-24 w-24 items-center justify-center rounded-3xl ${color} ${hoverColor} text-white shadow-lg transition-all duration-300 group-hover:scale-110`}
        >
          <div className="h-14 w-14">{icon}</div>
        </div>
      </div>

      <h3 className="mb-3 text-center text-xl font-bold text-[#2B5991]">
        {title}
      </h3>
      <p className="text-center text-sm leading-relaxed text-[#2B5991]">
        {desc}
      </p>
    </div>
  );
}
