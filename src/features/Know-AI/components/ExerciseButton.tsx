import { useNavigate } from '@/router';

export default function ExerciseButton({
  number,
  done,
  level,
  questionId,
  locked,
}: any) {
  const navigate = useNavigate();

  const handleClick = () => {
    // Lock cannot click
    if (locked) return;

    // If correct cannot click
    if (done) return;

    navigate('/Know-AI/exercises/:level/:question', {
      params: {
        level: String(level),
        question: String(questionId),
      },
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={locked || done}
      className={`flex h-24 w-24 transform items-center justify-center rounded-full text-2xl font-bold text-white shadow-lg transition-all duration-300 ${
        locked
          ? 'cursor-not-allowed bg-gray-300 opacity-50'
          : done
            ? 'cursor-not-allowed bg-linear-to-br from-green-400 to-green-700'
            : 'bg-linear-to-br from-sky-400 to-blue-600 hover:scale-110 hover:from-sky-500 hover:to-blue-700 hover:shadow-xl'
      }`}
    >
      {locked ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-10 w-10 opacity-50"
        >
          <path
            fillRule="evenodd"
            d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        number
      )}
    </button>
  );
}
