import { useState, useEffect } from 'react';
import type { Event } from '../types/types';
import { getEvents } from '../api/waste-management-api';

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvents().then((data) => {
      setEvents(data);
      setLoading(false);
    });
  }, []);

  return { events, loading };
}
