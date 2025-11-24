import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from '@/router';
import React, { useEffect, useMemo, useState } from 'react';
import { createReport, updateReport } from '../api/reports.api';
import { useUserRole } from '../hooks/useUserRole';
import type { Report } from '@/types/reports';
import Nav from './Nav';

interface ReportFormProps {
  oldReport?: Report | null;
}

function ReportForm({ oldReport }: ReportFormProps) {
  const [form, setForm] = useState({
    title: '',
    url: '',
    visibility: 'citizens',
    type: 'summary',
    category: 'healthcare',
    description: '',
  });

  useEffect(() => {
    if (oldReport) {
      setForm({
        title: oldReport.title_string || '',
        url: oldReport.power_bi_report_id_string || '',
        visibility: (oldReport.visibility || 'citizens') as
          | 'citizens'
          | 'admin',
        type: (oldReport.power_bi_report_type || 'summary') as
          | 'summary'
          | 'trends',
        category:
          oldReport.dim_category?.category_name?.toLowerCase() || 'healthcare',
        description: oldReport.description_string || '',
      });
    }
  }, [oldReport]);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { role } = useUserRole();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (role !== 'admin') {
        throw new Error('You do not have permission to perform this action');
      }

      if (oldReport) {
        // Update existing report
        await updateReport(
          oldReport.report_id,
          {
            title: form.title,
            description: form.description || null,
            category: form.category,
            embedUrl: form.url || null,
            visibility: form.visibility as 'citizens' | 'admin',
            type: form.type as 'summary' | 'trends',
          },
          role
        );
      } else {
        // Create new report
        await createReport(
          {
            title: form.title,
            description: form.description || null,
            category: form.category,
            embedUrl: form.url || null,
            visibility: form.visibility as 'citizens' | 'admin',
            type: form.type as 'summary' | 'trends',
          },
          role
        );
      }
      setSubmitted(true);
      navigate('/power-bi');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save report');
      console.error('Error saving report:', err);
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    'rounded-2xl border border-[#D9D9D9] bg-white px-4 py-3 text-[#2B5991] placeholder:text-[#2B5991]/60 shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#01CCFF]';

  const isEditing = useMemo(() => Boolean(oldReport), [oldReport]);

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB] px-4 pt-6 pb-10 text-[#1B1F3B] md:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <Nav />

        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xl shadow-[#0D111D]/5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.4em] text-[#2B5991] uppercase">
                {isEditing ? 'Update Report' : 'Create Report'}
              </p>
              <h1 className="mt-1 text-3xl leading-tight font-black">
                {isEditing ? 'Edit existing insights' : 'Publish a new insight'}
              </h1>
              <p className="text-sm text-[#4A5568]">
                Provide a short description, category and embed link. Tailor
                visibility and report type to match its audience.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate(-1)}
                className="cursor-pointer border-[#CBD5F5] bg-transparent text-[#2B5991] hover:bg-[#E8F4FF]"
              >
                ← Back
              </Button>
              <Button
                type="button"
                onClick={() => navigate('/power-bi')}
                className="cursor-pointer bg-[#01CCFF] text-white hover:bg-[#0091B5]"
              >
                View Library
              </Button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-[#F3F7FD] px-4 py-3 text-sm text-[#4A5568]">
              <p className="text-xs font-semibold tracking-[0.2em] text-[#2B5991] uppercase">
                Status
              </p>
              <p>{role === 'admin' ? 'Admin access confirmed' : role}</p>
            </div>
            <div className="rounded-2xl bg-[#F3F7FD] px-4 py-3 text-sm text-[#4A5568]">
              <p className="text-xs font-semibold tracking-[0.2em] text-[#2B5991] uppercase">
                Visibility
              </p>
              <p>
                {form.visibility === 'admin'
                  ? 'Restricted — internal only'
                  : 'Citizen friendly'}
              </p>
            </div>
            <div className="rounded-2xl bg-[#F3F7FD] px-4 py-3 text-sm text-[#4A5568]">
              <p className="text-xs font-semibold tracking-[0.2em] text-[#2B5991] uppercase">
                Category
              </p>
              <p className="capitalize">{form.category}</p>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}
          {submitted && (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              Report {isEditing ? 'updated' : 'created'} successfully.
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-6 grid gap-6 text-sm md:grid-cols-2"
          >
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label className="text-[#1B1F3B]">Report Title</Label>
                <Input
                  name="title"
                  type="text"
                  placeholder="City services performance"
                  value={form.title}
                  onChange={handleChange}
                  className={fieldClass}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-[#1B1F3B]">Power BI URL</Label>
                <Input
                  name="url"
                  type="text"
                  placeholder="https://app.powerbi.com/..."
                  value={form.url}
                  onChange={handleChange}
                  className={fieldClass}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-[#1B1F3B]">Visibility</Label>
                <select
                  name="visibility"
                  value={form.visibility}
                  onChange={handleChange}
                  className={`${fieldClass} cursor-pointer`}
                >
                  <option value="citizens">Citizens</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-[#1B1F3B]">Type of Report</Label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className={`${fieldClass} cursor-pointer`}
                >
                  <option value="summary">
                    Summary City Performance Dashboard
                  </option>
                  <option value="trends">Public Trends Report</option>
                  <option value="detailed">
                    Detailed Operational Dashboards
                  </option>
                  <option value="planning">
                    Financial & Resource Planning
                  </option>
                  <option value="usage">Report Usage Analysis</option>
                  <option value="data">Data Quality Dashboard</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-[#1B1F3B]">Category</Label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={`${fieldClass} cursor-pointer`}
                >
                  <option value="healthcare">Healthcare</option>
                  <option value="weather">Weather</option>
                  <option value="demographic">Demographic</option>
                  <option value="traffic">Traffic</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-[#1B1F3B]">Description</Label>
              <Textarea
                name="description"
                placeholder="Describe what this report uncovers and how teams should use it."
                className={`${fieldClass} h-full min-h-[280px] resize-none`}
                value={form.description}
                onChange={handleChange}
              />
            </div>
          </form>

          <div className="mt-8 flex flex-col gap-4 border-t border-[#E2E8F0] pt-6 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-[#4A5568]">
              Need a new dataset connected? Reach out to analytics, or attach it
              in the admin console after saving.
            </p>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="cursor-pointer bg-[#2B5991] px-8 py-6 text-base font-semibold text-white hover:bg-[#234678]"
              disabled={loading}
            >
              {loading
                ? 'Saving...'
                : isEditing
                  ? 'Save changes'
                  : 'Create report'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportForm;
