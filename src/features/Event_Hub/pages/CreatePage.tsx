import React, { useState } from 'react';
import { createEvent } from '@/features/Event_Hub/api/Event.api';

const CreateEventPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    total_seats: '',
    start_date: '',
    end_date: '',
    organization_id: '',
    address_id: '',
    event_tag_id: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Use date only, time defaults to 00:00
      const start_at = new Date(formData.start_date).toISOString();
      const end_at = new Date(formData.end_date).toISOString();

      const eventData = {
        host_user_id: 1,
        title: formData.title,
        description: formData.description || undefined,
        total_seats: formData.total_seats
          ? parseInt(formData.total_seats, 10)
          : undefined,
        start_at,
        end_at,
        organization_id: formData.organization_id
          ? parseInt(formData.organization_id, 10)
          : null,
        address_id: formData.address_id
          ? parseInt(formData.address_id, 10)
          : null,
        event_tag_id: formData.event_tag_id
          ? parseInt(formData.event_tag_id, 10)
          : null,
      };

      await createEvent(eventData);

      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        total_seats: '',
        start_date: '',
        end_date: '',
        organization_id: '',
        address_id: '',
        event_tag_id: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Create New Event</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>Event created successfully!</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Title *
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div>
          <label>
            Description
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </label>
        </div>

        <div>
          <label>
            Start Date *
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div>
          <label>
            End Date *
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div>
          <label>
            Total Seats
            <input
              type="number"
              name="total_seats"
              value={formData.total_seats}
              onChange={handleChange}
              min={1}
            />
          </label>
        </div>

        <div>
          <label>
            Organization ID
            <input
              type="number"
              name="organization_id"
              value={formData.organization_id}
              onChange={handleChange}
            />
          </label>
        </div>

        <div>
          <label>
            Address ID
            <input
              type="number"
              name="address_id"
              value={formData.address_id}
              onChange={handleChange}
            />
          </label>
        </div>

        <div>
          <label>
            Event Tag ID
            <input
              type="number"
              name="event_tag_id"
              value={formData.event_tag_id}
              onChange={handleChange}
            />
          </label>
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
};

export default CreateEventPage;
