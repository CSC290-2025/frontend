import bgImg from '../../../../public/smartcitybackground_login.png';
import logo from '../../../../public/smartcityhub.png';
import LoginUI from '../components/LoginUI';
import { useAuthenticated } from '@/hooks/useAuthenticated';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

function Login() {
  const { data, isLoading, isError } = useAuthenticated();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect after loading is finished and user is authenticated
    // Guard on isLoading to avoid redirecting while the query is still in flight
    if (!isLoading && !isError && data) {
      // If your `data` shape is an object, prefer checking a specific field
      // e.g. `data.id` or `data.user` to avoid truthy-empty-object redirects
      navigate('/');
    }
    console.log('useAuthenticated data:', { data, isLoading, isError });
  }, [data, isLoading, isError, navigate]);
  return (
    <div
      className="relative flex min-h-screen flex-col items-center bg-cover bg-center p-14 px-4"
      style={{ backgroundImage: `url(${bgImg})`, backgroundPosition: 'top' }}
    >
      {/* Gradient overlay at bottom */}
      <div className="inset absolute" />
      <div className="mb-8 flex items-center space-x-2">
        <img src={logo} alt="Smart City Hub" className="h-14 w-14" />
        <h3 className="text-2xl font-bold text-[#1E3A8A] sm:text-2xl">
          SMART CITY HUB
        </h3>
      </div>
      <LoginUI />
    </div>
  );
}

export default Login;
