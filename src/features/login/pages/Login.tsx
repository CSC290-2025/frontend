import bgImg from '../../../components/img/smartcitybackground_login.png';
import logo from '../../../components/img/smartcitylogo.png';
import LoginUI from '../components/LoginUI';
function Login() {
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
