import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from '@/router';
import React, { useEffect, useState } from 'react';
import { createReport, updateReport } from '../api/reports.api';
import { useUserRole } from '../hooks/useUserRole';
import type { Report } from '@/types/reports';

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

  return (
    <div className="flex h-screen w-screen flex-col justify-between p-7">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3 font-bold">
          <Button
            variant="outline"
            type="button"
            onClick={() => navigate(-1)} // goes back one page
            className="px-3"
          >
            ← Back
          </Button>
          <h1 className="text-xl font-medium">
            {oldReport ? 'Edit Report' : 'Create New Report'}
          </h1>
          {error && (
            <div className="rounded bg-red-100 p-2 text-red-700">{error}</div>
          )}
          {submitted && (
            <div className="rounded bg-green-100 p-2 text-green-700">
              Report {oldReport ? 'updated' : 'created'} successfully
            </div>
          )}
        </div>
      </div>

      {/* {submitted && <div>report created successfully</div>} */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 justify-around gap-5 text-sm md:grid-cols-2"
      >
        <div className="w-full">
          <div className="mb-7 flex flex-col gap-1">
            <Label>Report Title</Label>
            <Input
              name="title"
              type="text"
              placeholder="title"
              value={form.title}
              onChange={handleChange}
            />
          </div>
          <div className="mb-7 flex flex-col gap-1">
            <Label>Power BI URL</Label>
            <Input
              name="url"
              type="text"
              placeholder="link"
              value={form.url}
              onChange={handleChange}
            />
          </div>
          <div className="mb-7 flex flex-col gap-1">
            <Label>Visibility</Label>
            <select
              name="visibility"
              value={form.visibility}
              onChange={handleChange}
            >
              {/* change to select from ui folder later*/}
              <option value="citizens">Citizens</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="mb-7 flex flex-col gap-1">
            <Label>Type of Report</Label>
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="summary">
                Summary City Performance Dashboard
              </option>
              <option value="trends">Public Trends Report</option>
            </select>
          </div>
          <div className="mb-7 flex flex-col gap-1">
            <Label>Category</Label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option value="healthcare">Healthcare</option>
              <option value="weather">Weather</option>
              <option value="demographic">Demographic</option>
              <option value="traffic">Traffic</option>
            </select>
          </div>
        </div>
        <div className="h-full w-full">
          <Label className="mb-1">Description</Label>
          <Textarea
            name="description"
            placeholder="description"
            className="h-full w-full"
            value={form.description}
            onChange={handleChange}
          />
        </div>
      </form>
      <Button
        type="submit"
        onClick={handleSubmit}
        className="self-center bg-[#01CCFF] px-2 px-5 hover:bg-[#0091B5]"
        disabled={loading}
      >
        {loading ? 'Saving...' : oldReport ? 'Save Changes' : 'Create'}
      </Button>
    </div>
  );
}

export default ReportForm;
