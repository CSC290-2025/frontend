export default function QuestionHeader({ level, question }: any) {
  const levelLabel = ['Beginner', 'Intermediate', 'Advanced'][
    Number(level) - 1
  ];

  const levelColors = [
    'bg-green-100 text-green-700 border-green-200',
    'bg-yellow-100 text-yellow-700 border-yellow-200',
    'bg-red-100 text-red-700 border-red-200',
  ];

  // Calculate question number
  const questionInLevel = ((Number(question) - 1) % 3) + 1;

  return (
    <div className="mb-6 w-full max-w-3xl">
      <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-md">
        <div className="flex items-center gap-3">
          <span
            className={`rounded-lg border-2 px-4 py-2 text-sm font-bold ${
              levelColors[Number(level) - 1]
            }`}
          >
            {levelLabel}
          </span>
          <div className="h-6 w-px bg-gray-300"></div>
          <span className="text-lg font-semibold text-gray-700">
            Question {questionInLevel}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span>Level {level}</span>
        </div>
      </div>
    </div>
  );
}
