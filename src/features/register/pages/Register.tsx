import RegisterFormUI from '../components/RegisterForm';
import bgImg from '../../../../public/smartcitybackground_login.png';
import { useAuthenticated } from '@/hooks/useAuthenticated';
import { useEffect, useState } from 'react';
import { useNavigate } from '@/router';
export default function RegisterForm() {
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
      <div className="mx-auto rounded-2xl bg-white p-8 shadow-md">
        <RegisterFormUI></RegisterFormUI>
      </div>
    </div>
  );
}
