export default function QuestionBox({ text }: { text: string }) {
  return (
    <div className="mb-8 w-full max-w-3xl">
      <div className="rounded-2xl bg-linear-to-br from-blue-400 to-blue-600 p-8 shadow-xl">
        <div className="mb-2 flex items-center gap-2">
          {/* <svg 
            className="h-5 w-5 text-white/80" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg> */}
          <span className="text-sm font-semibold tracking-wide text-white/90 uppercase">
            Question :
          </span>
        </div>
        <p className="text-xl leading-relaxed text-white md:text-2xl">{text}</p>
      </div>
    </div>
  );
}
