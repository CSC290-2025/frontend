// import { useState } from 'react';
// import { useParams, useNavigate } from '@/router';
// import { useQuestion } from '@/features/Know-AI/hooks/useQuestion';
// import { useSubmitAnswer } from '@/features/Know-AI/hooks/useSubmitAnswer';
// import QuestionHeader from '@/features/Know-AI/components/QuestionHeader';
// import QuestionBox from '@/features/Know-AI/components/QuestionBox';
// import PromptInputBox from '@/features/Know-AI/components/PromptInputBox';
// import SubmitModal from '@/features/Know-AI/components/SubmitModal';
// import { useQueryClient } from '@tanstack/react-query';
// import { useGetAuthMe } from '@/api/generated/authentication';

// export default function ExerciseQuestionPage() {
//   const navigate = useNavigate();
//   const { level, question } = useParams('/Know-AI/exercises/:level/:question');
//   const questionId = Number(question);
//   const queryClient = useQueryClient();

//   const userId = useGetAuthMe().data?.data?.userId??null;

//   const { data: questionData, isLoading } = useQuestion(questionId);
//   const [promptInput, setPromptInput] = useState('');
//   const [modalOpen, setModalOpen] = useState(false);
//   const [evaluation, setEvaluation] = useState(null);

//   const submitMutation = useSubmitAnswer();

//   const handleSubmit = () => {
//     if(!userId) return;
//     submitMutation.mutate(
//       {
//         questionId,
//         userId,
//         answer: promptInput,
//       },
//       {
//         onSuccess: (res) => {
//           setEvaluation(res);
//           setModalOpen(true);

//           queryClient.invalidateQueries({
//             queryKey: ['exerciseProgress', Number(level), userId]
//           });
//         },
//       }
//     );
//   };

//   const handleClose = () => {
//     setModalOpen(false);
//     setEvaluation(null);
//     setPromptInput('');
//     navigate('/Know-AI/exercises');
//   };

//   const handleNext = () => {
//     setModalOpen(false);
//     setEvaluation(null);
//     setPromptInput('');
//     navigate('/Know-AI/exercises/:level/:question', {
//       params: {
//         level: String(level),
//         question: String(Number(question) + 1),
//       },
//     });
//   };

//   if (isLoading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 via-white to-purple-50">
//         <div className="text-center">
//           <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
//           <p className="text-gray-600">Loading question...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex min-h-screen flex-col items-center bg-linear-to-br from-blue-50 via-white to-purple-50 px-4 py-8 md:py-12">
//       {/* Back Button */}
//       <div className="mb-6 w-full max-w-3xl">
//         <button
//           onClick={() => navigate('/Know-AI/exercises')}
//           className="group flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
//         >
//           <svg
//             className="h-5 w-5 transition-transform group-hover:-translate-x-1"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M15 19l-7-7 7-7"
//             />
//           </svg>
//           <span className="font-medium">Back to Exercises</span>
//         </button>
//       </div>

//       {/* Header */}
//       <QuestionHeader level={level} question={question} />

//       {/* Question */}
//       <QuestionBox text={questionData.question} />

//       {/* Input */}
//       <PromptInputBox value={promptInput} onChange={setPromptInput} />

//       {/* Submit Button */}
//       <button
//         onClick={handleSubmit}
//         disabled={!promptInput.trim() || submitMutation.isPending}
//         className="mt-8 flex items-center gap-3 rounded-full bg-linear-to-r from-green-400 to-green-500 px-10 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:from-green-500 hover:to-green-600 hover:shadow-xl disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none"
//       >
//         {submitMutation.isPending ? (
//           <>
//             <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
//             <span>Submitting...</span>
//           </>
//         ) : (
//           <>
//             <span>Submit Answer</span>
//             <svg
//               className="h-5 w-5"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M13 7l5 5m0 0l-5 5m5-5H6"
//               />
//             </svg>
//           </>
//         )}
//       </button>

//       {/* Popup */}
//       <SubmitModal
//         open={modalOpen}
//         result={evaluation}
//         onClose={handleClose}
//         onNext={handleNext}
//       />
//     </div>
//   );
// }

import { useState } from 'react';
import { useParams, useNavigate } from '@/router';
import { useQuestion } from '@/features/Know-AI/hooks/useQuestion';
import { useSubmitAnswer } from '@/features/Know-AI/hooks/useSubmitAnswer';
import QuestionHeader from '@/features/Know-AI/components/QuestionHeader';
import QuestionBox from '@/features/Know-AI/components/QuestionBox';
import PromptInputBox from '@/features/Know-AI/components/PromptInputBox';
import SubmitModal from '@/features/Know-AI/components/SubmitModal';
import { useQueryClient } from '@tanstack/react-query';
import { useGetAuthMe } from '@/api/generated/authentication';

export default function ExerciseQuestionPage() {
  const navigate = useNavigate();
  const { level, question } = useParams('/Know-AI/exercises/:level/:question');
  const questionId = Number(question);
  const queryClient = useQueryClient();

  const userId = useGetAuthMe().data?.data?.userId ?? null;

  const { data: questionData, isLoading } = useQuestion(questionId);
  const [promptInput, setPromptInput] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  const submitMutation = useSubmitAnswer();

  const handleSubmit = () => {
    if (!userId) return;
    submitMutation.mutate(
      {
        questionId,
        userId,
        answer: promptInput,
      },
      {
        onSuccess: (res) => {
          setEvaluation(res);
          setModalOpen(true);

          queryClient.invalidateQueries({
            queryKey: ['exerciseProgress', Number(level), userId],
          });
        },
      }
    );
  };

  const handleClose = () => {
    setModalOpen(false);
    setEvaluation(null);
    setPromptInput('');
    navigate('/Know-AI/exercises');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-linear-to-br from-blue-50 via-white to-purple-50 px-4 py-8 md:py-12">
      {/* Back Button */}
      <div className="mb-6 w-full max-w-3xl">
        <button
          onClick={() => navigate('/Know-AI/exercises')}
          className="group flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
        >
          <svg
            className="h-5 w-5 transition-transform group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="font-medium">Back to Exercises</span>
        </button>
      </div>

      {/* Header */}
      <QuestionHeader level={level} question={question} />

      {/* Question */}
      <QuestionBox text={questionData.question} />

      {/* Input */}
      <PromptInputBox value={promptInput} onChange={setPromptInput} />

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!promptInput.trim() || submitMutation.isPending}
        className="mt-8 flex items-center gap-3 rounded-full bg-linear-to-r from-green-400 to-green-500 px-10 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:from-green-500 hover:to-green-600 hover:shadow-xl disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none"
      >
        {submitMutation.isPending ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            <span>Submitting...</span>
          </>
        ) : (
          <>
            <span>Submit Answer</span>
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </>
        )}
      </button>

      {/* Popup */}
      <SubmitModal open={modalOpen} result={evaluation} onClose={handleClose} />
    </div>
  );
}
