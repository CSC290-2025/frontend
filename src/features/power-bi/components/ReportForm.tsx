import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import React from 'react';

function ReportForm() {
  return (
    <div className="flex h-screen w-screen flex-col justify-around p-7">
      <h1 className="text-ll text-center font-medium">Create New Report</h1>
      <div className="flex justify-around gap-5">
        <div className="w-1/2">
          <div className="mb-7 flex flex-col gap-1">
            <Label>Report Title</Label>
            <Input type="text" placeholder="title" />
          </div>
          <div className="mb-7 flex flex-col gap-1">
            <Label>Power BI URL</Label>
            <Input type="text" placeholder="link" />
          </div>
          <div className="mb-7 flex flex-col gap-1">
            <Label>Visibility</Label>
            <select name="visibility" id="visiibility">
              {/* change to select from ui folder later*/}
              <option value="citizens">Citizens</option>
              <option value="city-officials">City Officials</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="mb-7 flex flex-col gap-1">
            <Label>Type of Report</Label>
            <select name="type" id="type">
              <option value="summary">
                Summary City Performance Dashboard
              </option>
              <option value="trends">Public Trends Report</option>
            </select>
          </div>
          <div className="mb-7 flex flex-col gap-1">
            <Label>Category</Label>
            <select name="category" id="category">
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
            placeholder="description"
            className="h-full w-full"
            value="description"
          />
        </div>
      </div>
      <Button className="w-1/16 self-center">Create</Button>
    </div>
  );
}

export default ReportForm;
