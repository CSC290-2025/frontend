type Props = {
  warning?: string;
  detail?: string;
  onClick?: () => void;
};

export default function WarningBox({ warning, detail, onClick }: Props) {
  if (!warning) return null;

  return (
    <div
      className="cursor-pointer rounded-2xl border border-red-300 bg-red-50 p-6 shadow-sm"
      onClick={onClick}
    >
      <div className="mb-2 flex items-center gap-2 text-lg font-bold text-red-700">
        ⚠️ {warning}
      </div>

      <div className="leading-snug font-semibold text-red-500">{detail}</div>
    </div>
  );
}
