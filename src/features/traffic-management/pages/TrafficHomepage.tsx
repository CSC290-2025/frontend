//import
export default function TrafficHomePage() {
  return (
    <main className="p-6">
      <h1 className="mb-2 text-3xl font-bold">Traffic Management System</h1>
      <p className="mb-6 text-gray-600">
        Monitor and manage traffic lights and density across the city
      </p>

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <a
          href="#monitor"
          className="block rounded-lg border-2 border-blue-200 bg-blue-50 p-6 transition hover:border-blue-400"
        >
          <h2 className="mb-2 text-xl font-semibold">Traffic Monitor</h2>
          <p className="text-gray-600">
            View real-time traffic lights and density information
          </p>
        </a>

        <a
          href="#admin"
          className="block rounded-lg border-2 border-purple-200 bg-purple-50 p-6 transition hover:border-purple-400"
        >
          <h2 className="mb-2 text-xl font-semibold">Admin Control</h2>
          <p className="text-gray-600">
            Manage traffic light timings and settings
          </p>
        </a>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold">Quick Stats</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">12</div>
            <div className="text-sm text-gray-600">Active Lights</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">8</div>
            <div className="text-sm text-gray-600">Normal Flow</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">3</div>
            <div className="text-sm text-gray-600">High Density</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">1</div>
            <div className="text-sm text-gray-600">Critical</div>
          </div>
        </div>
      </div>
    </main>
  );
}
