export default function QuestionBox({ text }: { text: string }) {
  return (
    <div className="mb-8 w-full max-w-3xl">
      <div className="rounded-2xl bg-linear-to-br from-[#01CCFF] to-[#01CCFF] p-8 shadow-xl">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-sm font-semibold tracking-wide text-white/90 uppercase">
            Question :
          </span>
        </div>
        <p className="text-xl leading-relaxed text-white md:text-2xl">{text}</p>
      </div>
    </div>
  );
}
