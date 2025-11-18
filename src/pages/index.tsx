import { useAuthenticated } from '@/hooks/useAuthenticated';
import { useNavigate } from '@/router';
import { useEffect } from 'react';

export default function Home() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useAuthenticated();

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
    </div>
  );
}
