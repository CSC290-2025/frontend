import bgImg from '/smartcitybackground_login.png';
import logo from '/smartcityhub.png';
import LoginForm from '../components/LoginForm';
import { useAuth } from '@/features/auth';
import { useEffect } from 'react';
import { useNavigate } from '@/router';

function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (user) return null;

  return (
    <div
      className="relative flex min-h-screen flex-col items-center bg-cover bg-center p-14 px-4"
      style={{ backgroundImage: `url(${bgImg})`, backgroundPosition: 'top' }}
    >
      <div className="inset absolute" />
      <div className="mb-8 flex items-center space-x-2">
        <img src={logo} alt="Smart City Hub" className="h-14 w-14" />
        <h3 className="text-2xl font-bold text-[#1E3A8A] sm:text-2xl">
          SMART CITY HUB
        </h3>
      </div>
      <LoginForm />
    </div>
  );
}

export default Login;
