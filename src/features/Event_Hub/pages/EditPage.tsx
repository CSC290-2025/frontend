import React, { useEffect, useState } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Save,
  Loader2,
  Image as ImageIcon,
  ChevronLeft,
  Trash2,
  Building2,
  Cloud,
  Hospital,
  AlertCircle,
  Users,
  Mail,
  Phone,
  Tag,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router';

import Layout from '@/components/main/Layout';
import TopBar from '@/features/Event_Hub/component/Topbar';
import {
  fetchEventById,
  updateEvent,
  deleteEvent,
} from '@/features/Event_Hub/api/Event.api';

/* ---------------------------- TYPES ---------------------------- */

interface EventForm {
  title: string;
  description: string;
  image_url: string;
  total_seats: string; // Kept as string for input handling
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  organization_name: string;
  organization_email: string;
  organization_phone: string;
  address_line: string;
  province: string;
  district: string;
  subdistrict: string;
  postal_code: string;
  event_tag_name: string;
}

const TOP_BAR_CATEGORIES = [
  {
    id: 'dashboard',
    icon: Building2,
    label: 'City Insights',
    subtitle: 'Explore City',
  },
  {
    id: 'events',
    icon: Calendar,
    label: 'Events',
    subtitle: 'Local Activities',
  },
  {
    id: 'weather',
    icon: Cloud,
    label: 'Weather',
    subtitle: 'Current Forecast',
  },
  {
    id: 'healthcare',
    icon: Hospital,
    label: 'Healthcare',
    subtitle: 'Medical Centers',
  },
];

/* ---------------------------- HELPERS ---------------------------- */

const toDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
};

const toTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return isNaN(d.getTime())
    ? '00:00'
    : d.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
};

const transformApiToForm = (e: any): EventForm => {
  return {
    title: e.title || '',
    description: e.description || '',
    image_url: e.image_url || '',
    total_seats: e.total_seats?.toString() || '',
    start_date: toDate(e.start_at),
    start_time: toTime(e.start_at),
    end_date: toDate(e.end_at),
    end_time: toTime(e.end_at),
    organization_name: e.event_organization.name || '',
    organization_email: e.event_organization.email || '',
    organization_phone: e.event_organization.phone_number || '',
    address_line: e.addresses.address_line || '',
    province: e.addresses.province || '',
    district: e.addresses.district || '',
    subdistrict: e.addresses.subdistrict || '',
    postal_code: e.addresses.postal_code || '',
    event_tag_name: e.event_tag?.name || '',
  };
};

/* ---------------------------- COMPONENT ---------------------------- */

const EditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const eventId = Number(id);

  const [formData, setFormData] = useState<EventForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchEventById(eventId);
        console.log(res.data.data);
        const data = (res as any)?.data?.data ?? (res as any)?.data ?? res;
        setFormData(transformApiToForm(data.event));
      } catch (err) {
        setError('Failed to load event details.');
      } finally {
        setLoading(false);
      }
    };
    if (eventId) load();
  }, [eventId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        image_url: formData.image_url || undefined,
        total_seats: formData.total_seats
          ? parseInt(formData.total_seats, 10)
          : undefined,
        start_date: formData.start_date,
        start_time: formData.start_time,
        end_date: formData.end_date,
        end_time: formData.end_time,
        organization: {
          name: formData.organization_name,
          email: formData.organization_email,
          phone_number: formData.organization_phone,
        },
        address: {
          address_line: formData.address_line || undefined,
          province: formData.province || undefined,
          district: formData.district || undefined,
          subdistrict: formData.subdistrict || undefined,
          postal_code: formData.postal_code || undefined,
        },
        event_tag_name: formData.event_tag_name || undefined,
      };

      await updateEvent(eventId, payload);
      navigate('/event_hub');
    } catch (err) {
      alert('Update failed. Please check your connection and inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Permanently delete this event?')) return;
    setSubmitting(true);
    try {
      await deleteEvent(eventId);
      navigate('/event_hub');
    } catch {
      alert('Delete failed.');
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="animate-spin text-cyan-500" />
        </div>
      </Layout>
    );

  if (error || !formData)
    return (
      <Layout>
        <div className="flex h-screen flex-col items-center justify-center">
          <AlertCircle className="mb-2 text-red-400" />
          <p>{error}</p>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <TopBar
        topCategories={TOP_BAR_CATEGORIES}
        onSelectCategory={(id) => id === 'events' && navigate('/event_hub')}
      />
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Ensure formData exists before rendering the form */}
        {formData && (
          <form onSubmit={handleSubmit} className="mx-auto max-w-6xl px-6 py-8">
            {/* Header with Save/Delete */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="rounded-full border bg-white p-2 hover:bg-gray-50"
                >
                  <ChevronLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold">Edit Event</h1>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-lg border border-red-200 px-4 py-2 text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-lg bg-cyan-500 px-6 py-2 font-bold text-white hover:bg-cyan-600"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}{' '}
                  Save Changes
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                {/* Basic Info - POPULATED WITH OLD DATA */}
                <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="aspect-video overflow-hidden rounded-xl bg-gray-100">
                    {formData.image_url ? (
                      <img
                        src={formData.image_url}
                        className="h-full w-full object-cover"
                        alt="Preview"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        <ImageIcon size={40} />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase">
                        Title
                      </label>
                      <input
                        name="title"
                        value={formData.title || ''}
                        onChange={handleChange}
                        className="w-full rounded-lg border p-2.5"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase">
                        image
                      </label>
                      <input
                        name="image_url"
                        value={formData.image_url || ''}
                        onChange={handleChange}
                        className="w-full rounded-lg border p-2.5"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase">
                        Event Tag
                      </label>
                      <div className="relative">
                        <Tag
                          className="absolute top-3 left-3 text-gray-400"
                          size={16}
                        />
                        <input
                          name="event_tag_name"
                          value={formData.event_tag_name || ''}
                          onChange={handleChange}
                          className="w-full rounded-lg border p-2.5 pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description || ''}
                      onChange={handleChange}
                      rows={4}
                      className="w-full rounded-lg border p-2.5"
                    />
                  </div>
                </div>

                {/* Organization Details - POPULATED WITH OLD DATA */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 font-bold text-cyan-600">
                    <Users size={18} /> Organization Details
                  </h3>
                  <div className="space-y-4">
                    <input
                      name="organization_name"
                      value={formData.organization_name || ''}
                      onChange={handleChange}
                      placeholder="Organization Name"
                      className="w-full rounded-lg border p-2.5"
                    />
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="relative">
                        <Mail
                          className="absolute top-3 left-3 text-gray-400"
                          size={16}
                        />
                        <input
                          name="organization_email"
                          value={formData.organization_email || ''}
                          onChange={handleChange}
                          placeholder="Email"
                          className="w-full rounded-lg border p-2.5 pl-10"
                        />
                      </div>
                      <div className="relative">
                        <Phone
                          className="absolute top-3 left-3 text-gray-400"
                          size={16}
                        />
                        <input
                          name="organization_phone"
                          value={formData.organization_phone || ''}
                          onChange={handleChange}
                          placeholder="Phone Number"
                          className="w-full rounded-lg border p-2.5 pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Details - POPULATED WITH OLD DATA */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 font-bold text-cyan-600">
                    <MapPin size={18} /> Location
                  </h3>
                  <div className="space-y-4">
                    <input
                      name="address_line"
                      value={formData.address_line || ''}
                      onChange={handleChange}
                      placeholder="Address Line"
                      className="w-full rounded-lg border p-2.5"
                    />
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <input
                        name="subdistrict"
                        value={formData.subdistrict || ''}
                        onChange={handleChange}
                        placeholder="Subdistrict"
                        className="rounded-lg border p-2.5"
                      />
                      <input
                        name="district"
                        value={formData.district || ''}
                        onChange={handleChange}
                        placeholder="District"
                        className="rounded-lg border p-2.5"
                      />
                      <input
                        name="province"
                        value={formData.province || ''}
                        onChange={handleChange}
                        placeholder="Province"
                        className="rounded-lg border p-2.5"
                      />
                      <input
                        name="postal_code"
                        value={formData.postal_code || ''}
                        onChange={handleChange}
                        placeholder="Postal Code"
                        className="rounded-lg border p-2.5"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar: Scheduling & Seats */}
              <div className="space-y-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 font-bold text-cyan-600">
                    <Clock size={18} /> Scheduling
                  </h3>
                  <div className="space-y-4">
                    <div className="rounded-lg bg-gray-50 p-3">
                      <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                        Start
                      </label>
                      <input
                        type="date"
                        name="start_date"
                        value={formData.start_date || ''}
                        onChange={handleChange}
                        className="mb-2 w-full border-b border-gray-200 bg-transparent font-medium focus:outline-none"
                      />
                      <input
                        type="time"
                        name="start_time"
                        value={formData.start_time || ''}
                        onChange={handleChange}
                        className="w-full bg-transparent font-medium focus:outline-none"
                      />
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                        End
                      </label>
                      <input
                        type="date"
                        name="end_date"
                        value={formData.end_date || ''}
                        onChange={handleChange}
                        className="mb-2 w-full border-b border-gray-200 bg-transparent font-medium focus:outline-none"
                      />
                      <input
                        type="time"
                        name="end_time"
                        value={formData.end_time || ''}
                        onChange={handleChange}
                        className="w-full bg-transparent font-medium focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 font-bold text-cyan-600">
                    <Users size={18} /> Capacity
                  </h3>
                  <div>
                    <label className="text-xs font-bold text-gray-500">
                      Total Seats
                    </label>
                    <input
                      type="number"
                      name="total_seats"
                      value={formData.total_seats || ''}
                      onChange={handleChange}
                      className="w-full rounded-lg border p-2.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default EditPage;
