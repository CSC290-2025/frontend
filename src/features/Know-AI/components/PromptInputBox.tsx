export default function PromptInputBox({ value, onChange }: any) {
  return (
    <div className="w-full max-w-3xl">
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Your Answer
        </label>
        <textarea
          className="h-48 w-full resize-none rounded-xl border-2 border-gray-200 bg-gray-50 p-4 text-gray-800 transition-all duration-200 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          placeholder="Type your prompt here..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="mt-2 text-right text-xs text-gray-500">
          {value.length} characters
        </div>
      </div>
    </div>
  );
}
