import { useAuthenticated } from '@/hooks/useAuthenticated';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import { useLogout } from '@/hooks/useLogout';
import { Button } from '@/components/ui/button';

export default function Home() {
  const navigate = useNavigate();

  const { mutate, isLoggingOut } = useLogout();
  const { data, isLoading, isError } = useAuthenticated();
  const handleLogout = () => {
    mutate(undefined, {
      onSuccess: () => {
        console.log('LOGGED OUT SUCCESSFULLY');
      },
    });
  };
  useEffect(() => {
    // Only redirect after loading is finished and user is not authenticated
    if (!isLoading && (isError || !data)) {
      navigate('/login');
    }
    console.log(data);
  }, [data, isLoading, isError, navigate]);
  if (!data) return <>Loading...</>;
  return (
    <div>
      <div>
        User ID: {data?.userId}, Authenticated: {data?.authenticated}
      </div>
      ;<h1>Home</h1>;
      <Button onClick={handleLogout}>
        {isLoggingOut ? 'Signing out...' : 'Sign out'}
      </Button>
    </div>
  );
}
