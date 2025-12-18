import { useNavigate } from 'react-router';

export default function FreecycleCTA() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 rounded-xl border p-6 text-center">
      <h2 className="text-xl font-semibold">Give items a second life</h2>
      <p className="text-gray-600">
        Share items you no longer need with the community through Freecycle.
      </p>

      <button
        onClick={() => navigate('/freecycle')}
        className="rounded-lg bg-green-600 px-6 py-2 text-white transition hover:bg-green-700"
      >
        Go to Freecycle
      </button>
    </div>
  );
}
