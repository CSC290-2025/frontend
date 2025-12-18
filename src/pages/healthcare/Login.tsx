import { useState } from 'react';
import { useNavigate } from '@/router';
import { Lock, Mail } from 'lucide-react';

const HealthcareLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        'http://localhost:3000/api/healthcare/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('healthcare_token', data.data.token);
      localStorage.setItem('healthcare_user', JSON.stringify(data.data.user));

      navigate('/healthcare/healthcare-admin'); // Updated to match existing route or my new route.
      // I created Dashboard.tsx at `pages/healthcare/admin/Dashboard.tsx` which maps to `/healthcare/admin/Dashboard`.
      // The router shows `/healthcare/healthcare-admin` exists.
      // I should stick to my new path `/healthcare/admin/Dashboard` IF generouted picked it up.
      // But since I can't verify generouted build, I should potentially output to where the router expects?
      // User said: "i have a log in as healthcare staff( which will take u to the admin pages instead of the user pages)".
      // I'll assume my new file `pages/healthcare/admin/Dashboard.tsx` will be found as `/healthcare/admin/dashboard`.
      // If not, I might need to put it in `pages/healthcare/healthcare-admin.tsx`.
      // Let's try to target `/healthcare/admin/dashboard`.

      navigate('/healthcare/healthcare-admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all hover:scale-[1.01]">
        <div className="bg-indigo-600 p-8 text-center text-white">
          <h1 className="mb-2 text-3xl font-bold">Healthcare Staff</h1>
          <p className="text-indigo-200">Secure Admin Access</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 animate-pulse rounded border-l-4 border-red-500 bg-red-50 p-4 text-red-700 transition-all">
              <p className="font-medium">Authentication Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-3 pr-4 pl-10 transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  placeholder="admin@healthcare.com"
                />
              </div>
            </div>

            <div className="relative">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-3 pr-4 pl-10 transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`transfom w-full rounded-lg bg-indigo-600 py-3 font-bold text-white shadow-lg transition-all hover:bg-indigo-700 hover:shadow-xl active:scale-95 ${loading ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              {loading ? 'Verifying...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HealthcareLogin;
