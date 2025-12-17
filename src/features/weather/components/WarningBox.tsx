type Props = {
  warning?: string;
  detail?: string;
  onClick?: () => void;
};

export default function WarningBox({ warning, detail, onClick }: Props) {
  const isWarning =
    (warning?.toLowerCase().includes('alert') ||
      warning?.toLowerCase().includes('warning')) ??
    false;

  if (!warning) return null;

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border p-6 shadow-lg transition-all duration-200 ${
        isWarning ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
      } ${
        onClick
          ? 'cursor-pointer hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] active:shadow-md'
          : ''
      }`}
    >
      <h2
        className={`mb-2 text-xl font-bold ${
          isWarning ? 'text-red-700' : 'text-green-700'
        }`}
      >
        {isWarning ? '⚠️' : '✅'} {warning}
      </h2>
      <p className="text-sm text-gray-600">{detail}</p>
    </div>
  );
}
