import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from '@/router';
import React, { useEffect, useState } from 'react';

function ReportForm({ oldReport }) {
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
      setForm(oldReport);
    }
  }, [oldReport]);

  const [submitted, setSubmitted] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (oldReport) {
      console.log('Updating report:', form);
    } else {
      console.log('Creating report:', form);
    }
    setSubmitted(true);
    navigate('/power-bi');
  };

  return (
    <div className="flex h-screen w-screen flex-col justify-around p-7">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
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
        </div>
      </div>

      {/* {submitted && <div>report created successfully</div>} */}
      <form onSubmit={handleSubmit} className="flex justify-around gap-5">
        <div className="w-1/2">
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
        <div className="h-full w-1/2">
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
        className="w-1/4 self-center px-2"
      >
        {oldReport ? 'Save Changes' : 'Create'}
      </Button>
    </div>
  );
}

export default ReportForm;
