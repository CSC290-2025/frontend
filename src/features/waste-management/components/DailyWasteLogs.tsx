import { Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import { useDailyLogs } from '@/features/waste-management/hooks/useDailyLogs';
import { useDeleteWasteLog } from '@/features/waste-management/hooks/useDeleteWasteLog';

export default function DailyWasteLogs() {
  const { data, isLoading, error, refetch } = useDailyLogs();
  const deleteMutation = useDeleteWasteLog();

  const handleDelete = async (logId: number) => {
    if (!confirm('Are you sure you want to delete this log?')) return;

    try {
      await deleteMutation.mutateAsync(logId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert('Error deleting log: ' + err.message);
      } else {
        alert('Error deleting log');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
        <AlertCircle className="text-red-600" size={20} />
        <div className="flex-1">
          <p className="text-red-800">Failed to load waste logs</p>
          <p className="text-sm text-red-600">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="rounded-lg p-2 hover:bg-red-100"
        >
          <RefreshCw size={18} />
        </button>
      </div>
    );
  }

  const logs = data?.logs || [];

  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-gray-600">No waste logs recorded today</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="rounded-lg bg-white shadow">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Today&apos;s Waste Logs
          </h2>
          <button
            onClick={() => refetch()}
            className="rounded-lg p-2 hover:bg-gray-100"
            title="Refresh logs"
          >
            <RefreshCw size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Table */}
        <div className="max-h-[calc(75vh-16rem)] overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Waste Type
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Weight (kg)
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700"></th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.log_id}
                  className="border-b last:border-b-0 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 text-gray-900">
                    {log.waste_type || 'Unknown Type'}
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                      {Number(log.weight).toFixed(2)} kg
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDelete(log.log_id)}
                      disabled={
                        deleteMutation.isPending &&
                        deleteMutation.variables === log.log_id
                      }
                      className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      title="Delete log"
                    >
                      {deleteMutation.isPending &&
                      deleteMutation.variables === log.log_id ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 size={20} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
