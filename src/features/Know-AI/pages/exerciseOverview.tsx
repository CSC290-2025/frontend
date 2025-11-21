import { useExerciseProgress } from '@/features/Know-AI/hooks/useExerciseProgress';
import ExerciseButton from '@/features/Know-AI/components/ExerciseButton';
import LevelBadge from '@/features/Know-AI/components/LevelBadge';
import { useEffect } from 'react';

export default function ExerciseOverviewPage() {
  const userId = 8;
  const levels = [1, 2, 3];

  const progress: Record<number, ReturnType<typeof useExerciseProgress>> = {
    1: useExerciseProgress(1, userId),
    2: useExerciseProgress(2, userId),
    3: useExerciseProgress(3, userId),
  };

  useEffect(() => {
    levels.forEach((level) => {
      progress[level]?.refetch?.();
    });
  }, []);

  // Check if a level is unlocked
  const isLevelUnlocked = (level: number) => {
    if (level === 1) return true;

    const previousLevel = level - 1;
    const prevProgress = progress[previousLevel];
    const prevData = prevProgress?.data;

    return prevData?.correct_answers === 3;
  };

  // Helper badge logic
  const renderBadgeContent = (level: number) => {
    const p = progress[level];
    const data = p?.data;
    const fullyDone = data?.correct_answers === 3 || data?.correct_answers >= 3;

    return (
      <div className="flex flex-col items-center gap-2">
        <LevelBadge
          title={['Beginner', 'Intermediate', 'Advanced'][level - 1]}
          active={!!fullyDone}
        />
        {data && !p.isLoading && (
          <div className="text-center text-xs text-gray-600">
            {data.correct_answers || 0}/{data.total_questions || 0} correct
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 px-4 py-8 md:py-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-10 text-center md:mb-16">
          <h1 className="mb-3 text-3xl font-bold text-gray-800 md:text-4xl">
            Welcome to Know-AI Exercise
          </h1>
          <p className="text-sm text-gray-600 md:text-base">
            Test your knowledge across three difficulty levels
          </p>
        </div>

        {/* Main Grid */}
        <div className="rounded-3xl bg-white p-6 shadow-xl md:p-20">
          <div className="flex flex-col items-center gap-10 md:grid md:grid-cols-[140px_1fr_160px] md:gap-10">
            {/* Desktop */}
            <div className="hidden flex-col gap-32 text-right md:flex lg:gap-30">
              {['Beginner', 'Intermediate', 'Advanced'].map((label, idx) => (
                <div
                  key={label}
                  className="flex h-24 flex-col items-end justify-center"
                >
                  <span className="text-lg font-semibold text-gray-700">
                    {label}
                  </span>
                  <span className="mt-1 text-xs text-gray-500">
                    Level {idx + 1}
                  </span>
                </div>
              ))}
            </div>

            {/* Button */}
            <div className="flex w-full flex-col gap-12 md:gap-32 lg:gap-30">
              {levels.map((level) => {
                const p = progress[level];
                const { isLoading, isError, data } = p;
                const label = ['Beginner', 'Intermediate', 'Advanced'][
                  level - 1
                ];
                const isUnlocked = isLevelUnlocked(level);

                return (
                  <div
                    className="relative flex flex-col items-center md:block"
                    key={level}
                  >
                    {/* Mobile buttons */}
                    <div className="mb-4 text-center md:hidden">
                      <span className="block text-lg font-semibold text-gray-700">
                        {label}
                      </span>
                      <span className="text-xs text-gray-500">
                        Level {level}
                      </span>
                    </div>

                    {/* Buttons Container */}
                    <div className="flex justify-center gap-4 md:gap-6">
                      {isLoading ? (
                        [0, 1, 2].map((index) => (
                          <div
                            key={index}
                            className="h-16 w-16 animate-pulse rounded-full bg-gray-200 md:h-24 md:w-24"
                          />
                        ))
                      ) : isError ? (
                        <div className="text-sm text-red-500">
                          Error level {level}
                        </div>
                      ) : (
                        data?.questions?.map(
                          (
                            q: {
                              id: number;
                              answered: boolean;
                              is_correct: boolean;
                            },
                            index: number
                          ) => {
                            const done =
                              q.answered === true && q.is_correct === true;

                            return (
                              <ExerciseButton
                                key={q.id}
                                number={index + 1}
                                questionId={q.id}
                                done={done}
                                answered={q.answered}
                                level={level}
                                locked={!isUnlocked}
                              />
                            );
                          }
                        )
                      )}
                    </div>

                    {/* Mobile Badge*/}
                    <div className="mt-6 md:hidden">
                      {renderBadgeContent(level)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Badges */}
            <div className="hidden flex-col items-center gap-32 md:flex lg:gap-30">
              {levels.map((level) => (
                <div
                  key={level}
                  className="flex h-24 items-center justify-center"
                >
                  {renderBadgeContent(level)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Percentage summary */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {levels.map((level) => {
            const p = progress[level];
            const data = p?.data;
            if (!data || p.isLoading) return null;

            const calculatedPercentage =
              data.total_questions > 0
                ? Math.round(
                    (data.correct_answers / data.total_questions) * 100
                  )
                : 0;

            return (
              <div
                key={level}
                className="rounded-xl bg-white p-4 text-center shadow"
              >
                <h3 className="mb-2 font-semibold text-gray-700">
                  Level {level}
                </h3>
                <div className="text-2xl font-bold text-blue-600">
                  {calculatedPercentage || 0}%
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {data.correct_answers}/{data.total_questions} Correct
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
