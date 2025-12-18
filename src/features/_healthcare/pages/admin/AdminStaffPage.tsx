import React, { useState, useEffect } from 'react';
import { UserPlus, MapPin, Users, Edit, Trash2, X } from 'lucide-react';

interface Staff {
  id: number;
  role: string | null;
  facilityId: number | null;
  user?: {
    id: number;
    email: string;
    username: string;
  };
  createdAt: string | null;
}

const AdminStaffPage = () => {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');

  // Data State
  const [staffList, setStaffList] = useState<Staff[]>([]);

  // Add Form State
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('admin');
  const [facilityId, setFacilityId] = useState('');
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Edit Modal State
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [editRole, setEditRole] = useState('');
  const [editFacilityId, setEditFacilityId] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('healthcare_token');
    if (storedToken) setToken(storedToken);
  }, []);

  useEffect(() => {
    if (token && activeTab === 'list') {
      fetchStaffList();
    }
  }, [token, activeTab]);

  const fetchStaffList = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(
        'http://localhost:3000/api/healthcare/staff',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const result = await response.json();
      if (result.success) {
        setStaffList(result.data.data);
      } else {
        setMessage({
          type: 'error',
          text: result.message || 'Failed to fetch staff list',
        });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(
        'http://localhost:3000/api/healthcare/auth/staff',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email,
            role,
            facilityId: facilityId ? Number(facilityId) : undefined,
          }),
        }
      );

      const data = await response.json();

      if (!data.success && !response.ok) {
        throw new Error(data.message || 'Failed to add staff');
      }

      setMessage({ type: 'success', text: 'Staff member added successfully!' });
      setEmail('');
      setFacilityId('');
      setRole('admin');
      setTimeout(() => setActiveTab('list'), 1500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async (id: number) => {
    if (
      !window.confirm(
        'Are you sure you want to remove this staff member? This action cannot be undone.'
      )
    )
      return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/healthcare/staff/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        fetchStaffList();
        setMessage({ type: 'success', text: 'Staff removed successfully' });
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Failed to delete staff',
        });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const openEditModal = (staff: Staff) => {
    setEditingStaff(staff);
    setEditRole(staff.role || 'staff');
    setEditFacilityId(staff.facilityId ? String(staff.facilityId) : '');
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/healthcare/staff/${editingStaff.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            role: editRole,
            facilityId: editFacilityId ? Number(editFacilityId) : null,
          }),
        }
      );
      const data = await response.json();

      if (data.success) {
        setEditingStaff(null);
        fetchStaffList();
        setMessage({ type: 'success', text: 'Staff updated successfully' });
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Failed to update staff',
        });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!token) return <div>Access Denied. Please login.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-sm text-gray-600">
            Manage access control and staff roles.
          </p>
        </div>
        <div className="flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('list')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${activeTab === 'list' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            Staff List
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${activeTab === 'add' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            Add Staff
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`flex items-center justify-between rounded-lg border p-4 text-sm ${message.type === 'success' ? 'border-green-100 bg-green-50 text-green-800' : 'border-red-100 bg-red-50 text-red-800'}`}
        >
          <div className="flex items-center gap-3">
            <span className="font-bold">
              {message.type === 'success' ? 'Success:' : 'Error:'}
            </span>
            {message.text}
          </div>
          <button onClick={() => setMessage(null)}>
            <X className="h-4 w-4 opacity-50 hover:opacity-100" />
          </button>
        </div>
      )}

      {activeTab === 'list' ? (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs font-medium text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Facility ID</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && staffList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : staffList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No staff members found.
                    </td>
                  </tr>
                ) : (
                  staffList.map((staff) => (
                    <tr
                      key={staff.id}
                      className="transition-colors hover:bg-gray-50/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {staff.user?.username || 'Unknown'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {staff.user?.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                            staff.role === 'admin'
                              ? 'border-purple-100 bg-purple-50 text-purple-700'
                              : staff.role === 'doctor'
                                ? 'border-blue-100 bg-blue-50 text-blue-700'
                                : 'border-gray-200 bg-gray-100 text-gray-700'
                          }`}
                        >
                          {staff.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {staff.facilityId ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {staff.facilityId}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {staff.createdAt
                          ? new Date(staff.createdAt).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(staff)}
                            className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStaff(staff.id)}
                            className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
                <UserPlus className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Grant Staff Access
              </h2>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6 flex gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
              <Users className="h-5 w-5 flex-shrink-0" />
              <p>
                Use this form to grant admin or staff privileges to an{' '}
                <strong>existing registered user</strong>. They must have an
                account before you can add them here.
              </p>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    User Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                    placeholder="user@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <div className="relative">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2 transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="admin">Admin (Full Access)</option>
                      <option value="staff">Staff (Limited Access)</option>
                      <option value="nurse">Nurse</option>
                      <option value="doctor">Doctor</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                    Facility ID{' '}
                    <span className="font-normal text-gray-400">
                      (Optional)
                    </span>
                  </label>
                  <input
                    type="number"
                    value={facilityId}
                    onChange={(e) => setFacilityId(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. 1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="rounded-lg px-6 py-2.5 font-medium text-gray-700 transition-all hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex min-w-[140px] items-center justify-center rounded-lg bg-indigo-600 px-6 py-2.5 font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow ${loading ? 'cursor-not-allowed opacity-70' : ''}`}
                >
                  {loading ? 'Processing...' : 'Grant Access'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingStaff && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm duration-200">
          <div className="animate-in zoom-in-95 w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 p-4">
              <h3 className="font-semibold text-gray-900">Edit Staff Member</h3>
              <button
                onClick={() => setEditingStaff(null)}
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateStaff} className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="nurse">Nurse</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Facility ID (Optional)
                </label>
                <input
                  type="number"
                  value={editFacilityId}
                  onChange={(e) => setEditFacilityId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. 1"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStaffPage;
