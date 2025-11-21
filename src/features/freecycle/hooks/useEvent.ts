import { useMutation } from '@tanstack/react-query';
import { createEvent, createVolunteerEvent } from '../api/event.api';

export function useCreateEvent() {
  return useMutation({
    mutationFn: createEvent,
  });
}

export function useCreateVolunteerEvent() {
  return useMutation({
    mutationFn: createVolunteerEvent,
  });
}
