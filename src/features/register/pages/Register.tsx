import RegisterFormUI from '../components/RegisterForm';
import bgImg from '../../../../public/smartcitybackground_login.png';

export default function RegisterForm() {
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
