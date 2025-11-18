import { useMutation } from '@tanstack/react-query';
import { createEvent } from '../api/event.api';

export function useCreateEvent() {
  return useMutation({
    mutationFn: createEvent,
  });
}
